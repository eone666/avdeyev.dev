import Container from "@/components/ui/container";
import Logo from "@/app/(MainLayout)/_components/logo";
import ThemeChanger from "@/app/(MainLayout)/_components/theme-changer";

export default function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 flex h-header items-center border-b">
      <Container className="flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          {/*<TextMenu />*/}
          <ThemeChanger />
        </nav>
      </Container>
    </header>
  );
}
