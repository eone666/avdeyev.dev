import { ReactNode } from "react";

import Header from "@/app/(MainLayout)/_components/header";
import Footer from "@/app/(MainLayout)/_components/footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="h-full">{children}</main>
      <Footer />
    </>
  );
}
