import Link from "next/link";
import { House, NotebookPen, CircleHelp, User } from "lucide-react";
import Image from "next/image";

export function Header() {
  return (
    <header className="top-0 z-50 sticky bg-brand backdrop-blur border-neutral/15">
      <div className="flex justify-center bg-background h-8"/>
      <nav className="flex max-md:flex-col justify-between items-center gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full max-w-7xl">
        <Link href="/#inicio" className="font-semibold text-background text-lg uppercase tracking-[0.22em]">
          <Image className="bg-background -mt-14 p-2 rounded-b-xl" src="/logo.png" width={150} height={75} alt="Logo da Luz Esperança" />
        </Link>

        <div className="flex max-sm:flex-col items-center gap-2 sm:gap-3">
          <Link className="gap-2 bg-background hover:bg-neutral hover:border-neutral text-foreground hover:text-background btn btn-sm" href="/#inicio">
            <House size={16} />
            Início
          </Link>
          <Link className="gap-2 bg-background hover:bg-neutral hover:border-neutral text-foreground hover:text-background btn btn-sm" href="/#inscricao">
            <NotebookPen size={16} />
            Inscrição
          </Link>
          <Link className="gap-2 bg-background hover:bg-neutral hover:border-neutral text-foreground hover:text-background btn btn-sm" href="/#faq">
            <CircleHelp size={16} />
            Orientações
          </Link>
          <Link className="gap-2 bg-background hover:bg-neutral hover:border-neutral text-foreground hover:text-background btn btn-sm" href="/tratamento">
            <User size={16} />
            Acompanhar Tratamento
          </Link>
        </div>
      </nav>
    </header>
  );
}