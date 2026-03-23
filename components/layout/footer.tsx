import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6 text-[11px] uppercase tracking-[0.16em] text-zinc-600 md:flex-row md:items-center md:justify-between md:px-10">
        <p>© 2024 Kudu Curated. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
          <Link href="#">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
