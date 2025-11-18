import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v2.35" />
      <path d="m19 5-1.4 1.4" />
      <path d="M22 12h-2.35" />
      <path d="m19 19-1.4-1.4" />
      <path d="M12 22v-2.35" />
      <path d="m5 19 1.4-1.4" />
      <path d="M2 12h2.35" />
      <path d="m5 5 1.4 1.4" />
      <path d="M12 12V6a2 2 0 0 1 4 0v6" />
      <path d="m12 12-2.5 2.5" />
      <path d="m12 18 4-4" />
      <path d="m8.5 10.5 4 4" />
    </svg>
  );
}
