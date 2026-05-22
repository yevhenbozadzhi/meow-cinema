"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        setSuccess(data?.message ?? "Login successful");
        const token = data?.accessToken ?? "";
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        router.push("/profile");
      } else {
        setError(data?.error ?? data?.message ?? "Login failed");
      }
    } catch {
      setError("Auth server is unavailable");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c38eb4] bg-white text-black"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c38eb4] bg-white text-black"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c38eb4] text-white p-2 rounded-md cursor-pointer"
        >
          {loading ? "Loading..." : "Login"}
        </Button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}
