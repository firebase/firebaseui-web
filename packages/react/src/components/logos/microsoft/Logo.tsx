import type { SVGProps } from "react";
const SvgLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
    <path fill="#ff5722" d="M22 22H6V6h16z" />
    <path fill="#4caf50" d="M42 22H26V6h16z" />
    <path fill="#ffc107" d="M42 42H26V26h16z" />
    <path fill="#03a9f4" d="M22 42H6V26h16z" />
  </svg>
);
export default SvgLogo;
