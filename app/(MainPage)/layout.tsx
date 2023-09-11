import { ReactNode } from "react";

import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header mainPage />
      <main className="h-full">{children}</main>
      <Footer />
    </>
  );
}
