import type { SVGProps } from "react";

type FlagProps = SVGProps<SVGSVGElement> & { width?: number };

// Bayroqlar oddiy SVG (emoji emas): 3:2 nisbat, kichik o'lchamda toza ko'rinadi
function Flag({ children, width = 28, ...props }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={(width * 2) / 3}
      viewBox="0 0 30 20"
      aria-hidden="true"
      className="shrink-0 rounded-[3px] ring-1 ring-black/10 dark:ring-white/10"
      {...props}
    >
      {children}
    </svg>
  );
}

export const FlagUz = (p: FlagProps) => (
  <Flag {...p}>
    <rect width="30" height="20" fill="#1eb53a" />
    <rect width="30" height="6.67" fill="#0099b5" />
    <rect y="6.67" width="30" height="6.66" fill="#ffffff" />
    <rect y="6.4" width="30" height="0.55" fill="#ce1126" />
    <rect y="13.05" width="30" height="0.55" fill="#ce1126" />
    <circle cx="4.6" cy="3.35" r="2.3" fill="#ffffff" />
    <circle cx="5.5" cy="3.35" r="2.05" fill="#0099b5" />
    <circle cx="8.6" cy="1.7" r="0.4" fill="#ffffff" />
    <circle cx="10.4" cy="1.7" r="0.4" fill="#ffffff" />
    <circle cx="12.2" cy="1.7" r="0.4" fill="#ffffff" />
    <circle cx="8.6" cy="3.35" r="0.4" fill="#ffffff" />
    <circle cx="10.4" cy="3.35" r="0.4" fill="#ffffff" />
    <circle cx="12.2" cy="3.35" r="0.4" fill="#ffffff" />
    <circle cx="8.6" cy="5" r="0.4" fill="#ffffff" />
    <circle cx="10.4" cy="5" r="0.4" fill="#ffffff" />
    <circle cx="12.2" cy="5" r="0.4" fill="#ffffff" />
  </Flag>
);

export const FlagRu = (p: FlagProps) => (
  <Flag {...p}>
    <rect width="30" height="20" fill="#d52b1e" />
    <rect width="30" height="13.34" fill="#0039a6" />
    <rect width="30" height="6.67" fill="#ffffff" />
  </Flag>
);
