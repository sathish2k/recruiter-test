/**
 * Text extraction for uploaded documents (stage 1 of resume parsing):
 * PDF via pdf-parse (pdfjs), DOCX via mammoth, plain text as-is.
 */

/** Bound the work a single upload can cause. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 12;
const MAX_CHARS = 60_000;

export class UnsupportedDocumentError extends Error {}
export class EmptyDocumentError extends Error {}

const PDF_TYPES = new Set(["application/pdf"]);
const DOCX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const TEXT_TYPES = new Set(["text/plain", "text/markdown"]);

/**
 * pdfjs (pdf-parse's engine) touches canvas globals at module scope, which a
 * server runtime has no implementation for — importing it bare throws
 * `ReferenceError: DOMMatrix is not defined`. Text extraction never rasterises,
 * so these inert stubs are enough and avoid pulling in the ~50MB native
 * `@napi-rs/canvas`. They must be installed *before* pdf-parse is imported,
 * which is why the import below is lazy.
 */
function installCanvasStubs() {
  const g = globalThis as Record<string, unknown>;
  g.DOMMatrix ??= class {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    scale() {
      return this;
    }
    translate() {
      return this;
    }
    multiply() {
      return this;
    }
    invertSelf() {
      return this;
    }
    transformPoint(point: unknown) {
      return point;
    }
  };
  g.ImageData ??= class {};
  g.Path2D ??= class {
    addPath() {}
  };
}

let pdfModule: Promise<typeof import("pdf-parse")> | null = null;
function loadPdfParse() {
  if (!pdfModule) {
    installCanvasStubs();
    pdfModule = import("pdf-parse");
  }
  return pdfModule;
}

async function fromPdf(bytes: Uint8Array): Promise<string> {
  const { PDFParse } = await loadPdfParse();
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText({ first: MAX_PAGES, pageJoiner: "\n\n" });
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function fromDocx(bytes: Uint8Array): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  return value ?? "";
}

/**
 * Collapses the blank-line runs both extractors leave behind, and strips
 * zero-width and bidi-override characters. The latter matters for safety, not
 * tidiness: they are how hidden instructions are smuggled into a document that
 * looks innocuous to the recruiter reading it.
 */
function tidy(text: string): string {
  return (
    text
      .normalize("NFKC")
      // biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point.
      .replace(/[\u0000-\u0008\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, MAX_CHARS)
  );
}

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

/** Legacy OLE2 `.doc` — mammoth reads only OOXML, so catch it by signature
 * rather than letting it surface as an empty parse. */
const OLE2 = [0xd0, 0xcf, 0x11, 0xe0];
const PDF = [0x25, 0x50, 0x44, 0x46];
const ZIP = [0x50, 0x4b, 0x03, 0x04];

/**
 * Returns the document's plain text. Dispatches on MIME type, falling back to
 * the file extension — browsers send an empty or generic type often enough.
 */
export async function extractDocumentText(file: {
  name: string;
  type: string;
  bytes: Uint8Array;
}): Promise<string> {
  const extension = extensionOf(file.name);
  let text: string;

  if (startsWith(file.bytes, OLE2)) {
    throw new UnsupportedDocumentError(
      "Legacy .doc files are not supported — save as PDF or .docx and try again",
    );
  }

  // Content sniffing wins over the declared type and the extension, both of
  // which are caller-controlled.
  if (startsWith(file.bytes, PDF) || PDF_TYPES.has(file.type) || extension === ".pdf") {
    text = await fromPdf(file.bytes);
  } else if (startsWith(file.bytes, ZIP) || DOCX_TYPES.has(file.type) || extension === ".docx") {
    text = await fromDocx(file.bytes);
  } else if (TEXT_TYPES.has(file.type) || extension === ".txt" || extension === ".md") {
    text = new TextDecoder().decode(file.bytes);
  } else {
    throw new UnsupportedDocumentError(
      `Unsupported document type "${file.type || extension || "unknown"}" — use PDF, DOCX or TXT`,
    );
  }

  const tidied = tidy(text);
  // A scanned/image-only PDF parses fine but yields nothing; say so plainly
  // rather than sending an empty prompt to the model.
  if (tidied.length < 20) {
    throw new EmptyDocumentError(
      "No text found in the document — it may be a scanned image, which needs OCR",
    );
  }
  return tidied;
}
