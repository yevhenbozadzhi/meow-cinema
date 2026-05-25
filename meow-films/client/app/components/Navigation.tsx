"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  { label: "Movies", href: "/movie" },
  { label: "Rooms", href: "/room" },
];

const navLinkClass =
  "inline-flex min-h-10 items-center justify-center rounded-md bg-[#c38eb4] px-4 py-2 text-center text-sm font-medium text-white transition-all duration-300 hover:bg-[#86a9cf] sm:text-base";

export default function Navigation() {
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuth(false);
        setProfile(null);
        return;
      }
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsAuth(true);
      } else {
        setIsAuth(false);
        setProfile(null);
      }
    };

    void fetchMe();
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
          {isAuth ? (
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
