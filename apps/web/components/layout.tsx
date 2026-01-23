import { Search } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

type MainLayoutProps = HTMLAttributes<HTMLDivElement>;

export function Layout({ children, className, ...props }: MainLayoutProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 shrink-0">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Search className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">DeepDiligence</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main
        className={cn("container mx-auto px-4 py-4 flex-1 overflow-hidden")}
      >
        {children}
      </main>
    </div>
  );
}
