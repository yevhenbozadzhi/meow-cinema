"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Favorites } from "../components/Favorites";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveAvatarSrc(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) return "/globe.svg";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${apiBase.replace(/\/$/, "")}${path}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    id: string;
    username: string;
    avatarUrl: string | null;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized");
      router.push("/login");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      body: formData,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to update avatar: " + res.statusText);
    }
    const data = await res.json();
    const newAvatarUrl = data.avatarUrl ?? null;
    if (newAvatarUrl) {
      setProfile(
        (prev) => ({ ...prev, avatarUrl: newAvatarUrl }) as typeof profile,
      );
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized");
          router.push("/login");
          return;
        }
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const contentType = res.headers.get("content-type") ?? "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : null;

        if (!res.ok || !data) {
          setError(data?.error ?? data?.message ?? "Error fetching profile");
          return;
        }

        setProfile(data);
      } catch {
        setError("Auth server is unavailable");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-semibold text-red-500">{error}</h1>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-semibold">Profile not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center ">
      <button
        onClick={() => router.push("/")}
        className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 absolute top-10 left-10"
      >
        <ArrowLeftIcon className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="group relative h-40 w-40 shrink-0">
          <img
            src={resolveAvatarSrc(profile.avatarUrl)}
            alt=""
            className="h-full w-full rounded-full border-2 border-gray-300 object-cover"
          />
          <label
            htmlFor="avatar"
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            Change Avatar
            <input
              id="avatar"
              type="file"
              onChange={updateAvatar}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        <h1 className="text-2xl font-bold">{profile.username}</h1>
        <p className="text-sm text-gray-500">{profile.email}</p>
      </div>

      <Favorites />
    </div>
  );
}
