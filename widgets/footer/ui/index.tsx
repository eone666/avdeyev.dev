import dayjs from "dayjs";

export default function Footer() {
  return (
    <footer className="flex h-footer items-center justify-center text-center">
      Copyright © {dayjs().year()} Ivan Avdeyev.
    </footer>
  );
}
