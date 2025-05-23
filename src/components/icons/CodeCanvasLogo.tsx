import type { SVGProps } from 'react';

export function CodeCanvasLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5" // Maintain aspect ratio
      aria-labelledby="codeCanvasLogoTitle"
      {...props}
    >
      <title id="codeCanvasLogoTitle">Code Canvas Logo</title>
      <style>
        {`
          .logo-text {
            font-family: var(--font-geist-mono, Menlo, Monaco, 'Courier New', monospace);
            font-size: 30px;
            font-weight: bold;
            fill: hsl(var(--primary));
          }
          .logo-brackets {
            font-family: var(--font-geist-mono, Menlo, Monaco, 'Courier New', monospace);
            font-size: 38px;
            font-weight: bold;
            fill: hsl(var(--accent));
          }
        `}
      </style>
      <text x="10" y="35" className="logo-brackets">{"<"}</text>
      <text x="35" y="35" className="logo-text">CodeCanvas</text>
      <text x="170" y="35" className="logo-brackets">{"/>"}</text>
    </svg>
  );
}
