"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  {
    label: "Movies",
    href: "/movie",
  },
  {
    label: "Rooms",
    href: "/room",
  },
];
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
    <div className="mb-10">
      <nav className="flex flex-col md:flex-row justify-between items-center p-4rounded-md text-white container mx-auto mb-5">
        <Logo />
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-[#c38eb4] cursor-pointer hover:bg-[#86a9cf] transition-all duration-300 text-center"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          {isAuth ? (
            <>
              <Link
                href="/profile"
                className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-[#c38eb4] cursor-pointer hover:bg-[#86a9cf] transition-all duration-300 text-center"
              >
                {profile?.username}
              </Link>
            </>
          ) : (
            <div className="flex flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-[#c38eb4] cursor-pointer hover:bg-[#86a9cf] transition-all duration-300 text-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-[#c38eb4] cursor-pointer hover:bg-[#86a9cf] transition-all duration-300 text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
