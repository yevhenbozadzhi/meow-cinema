"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <div className="flex items-center justify-start mb-4">
      <Image
        src="/Logo.svg"
        alt="Logo"
        width={40}
        height={40}
        className="h-20 w-20 shrink-0 cursor-pointer object-contain"
        onClick={handleClick}
      />
      <h1 className="text-2xl font-bold">MeowFilms</h1>
    </div>
  );
}
