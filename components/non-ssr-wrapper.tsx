import dynamic from "next/dynamic";
import { ReactNode } from "react";
const NonSSRWrapper = (props: { children: ReactNode }) => <>{props.children}</>;
export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
});
