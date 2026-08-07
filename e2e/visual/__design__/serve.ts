/**
 * Serves the Claude Design export so the parity suite can render the design
 * itself and read its computed styles.
 *
 * The screens are the authority for what the product looks like (see the
 * "Design source" section of CLAUDE.md), so they are checked in beside the
 * tests rather than fetched at run time — a suite that needs the network to
 * know what "correct" means is not a suite you can trust in CI.
 */
const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.E2E_DESIGN_PORT ?? 3020);
const INDEX = "AIRecruiter - Dashboard.dc.html";

Bun.serve({
  port: PORT,
  async fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname);
    const file = Bun.file(ROOT + (path === "/" ? INDEX : path.slice(1)));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});
console.log(`design fixture on http://localhost:${PORT}`);
