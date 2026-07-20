// Brand mark from the Claude Design source. The disc uses `currentColor` so it
// adapts to light/dark; the accent dot stays orange.
export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <defs>
        <mask id="brand-logo-mask">
          <rect width="48" height="48" fill="white" />
          <path d="M2 31 H46" stroke="black" strokeWidth="3.5" />
          <path d="M18 31 L44 13" stroke="black" strokeWidth="3.5" />
        </mask>
      </defs>
      <circle cx="24" cy="24" r="19" fill="currentColor" mask="url(#brand-logo-mask)" />
      <circle cx="45" cy="11" r="2.6" fill="#F59E0B" />
    </svg>
  );
}
