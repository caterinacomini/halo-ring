declare module "*.svg" {
  import type { SVGProps } from "react";
  const ReactComponent: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  export default ReactComponent;
}
