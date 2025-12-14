import { PropsWithChildren } from "react";

export async function PageNumber({ children }: PropsWithChildren) {
    return <div className="absolute bottom-0 left-0 right-0 p-6 pt-0 text-black text-xs text-center">{children}</div>
}