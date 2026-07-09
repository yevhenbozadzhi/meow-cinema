"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import { saveAuthSession } from "@/lib/auth-session";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-[#c38eb4] disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (res.ok) {
        const token = data?.accessToken ?? "";
        if (!token) {
          setError("Login failed: no access token");
          return;
        }
        saveAuthSession(token);
        setSuccess(data?.message ?? "Login successful");
        router.push("/profile");
      } else {
        setError(data?.error ?? data?.message ?? "Login failed");
      }
    } catch {
      setError("Auth server is unavailable");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          disabled={loading}
          required
          className={inputClass}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          disabled={loading}
          required
          className={inputClass}
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-[#c38eb4] p-2 text-white"
        >
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {success && <p className="mt-4 text-green-500">{success}</p>}
    </div>
  );
}
