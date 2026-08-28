import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentStaffRole } from "@/lib/auth";

export async function SiteHeader() {
  const role = await getCurrentStaffRole();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-bold">
            B
          </span>
          <h1 className="text-lg font-semibold tracking-tight">
            คิวตีแบดมินตัน
          </h1>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            ลงชื่อเข้าคิว
          </Link>
          {role ? (
            <>
              <Link
                href="/queue"
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
              >
                จัดการคิว
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              เข้าสู่ระบบ
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
