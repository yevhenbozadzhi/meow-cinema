"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { NavAuthSkeleton } from "./skeleton/Skeleton";
import { resolveAuthUser } from "@/lib/auth-session";

const NAVIGATION_ITEMS = [
  { label: "Movies", href: "/movie" },
  { label: "Rooms", href: "/room" },
];

const navLinkClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-[#c38eb4] px-4 py-2 text-center text-sm font-medium text-white transition-all duration-300 hover:bg-[#86a9cf] sm:text-base";

export default function Navigation() {
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();
  const hasResolvedAuth = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      if (!hasResolvedAuth.current) {
        setAuthLoading(true);
      }

      try {
        const user = await resolveAuthUser();
        if (cancelled) return;

        setProfile(user);
        setIsAuth(!!user);
        hasResolvedAuth.current = true;
      } finally {
        setAuthLoading(false);
      }
    };

    void fetchMe();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="mb-6 sm:mb-8">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <Logo />

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {NAVIGATION_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {authLoading ? (
            <NavAuthSkeleton />
          ) : isAuth ? (
            <Link href="/profile" className={navLinkClass}>
              {profile?.username}
            </Link>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
                Login
              </Link>
              <Link href="/register" className={navLinkClass}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
