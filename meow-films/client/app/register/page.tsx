"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        setError(data?.error ?? data?.message ?? "Registration failed");
        return;
      }

      setSuccess(data?.message ?? "Registered successfully");
      router.push("/profile");
    } catch {
      setError("Auth server is unavailable");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto flex flex-col gap-4 items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="p-2 rounded-md border border-gray-300 bg-white text-black"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 rounded-md border border-gray-300 bg-white text-black"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-2 rounded-md border border-gray-300 bg-white text-black"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="p-2 rounded-md border border-gray-300 bg-white text-black"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
        >
          {loading ? "Loading..." : "Register"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
}
