import { ReactNode } from "react";

import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header isMainPage />
      <main className="h-full">{children}</main>
      <Footer />
    </>
  );
}
