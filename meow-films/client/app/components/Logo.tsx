"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="mx-auto flex cursor-pointer items-center justify-center gap-2 lg:mx-0 lg:justify-start"
      aria-label="MeowFilms home"
    >
      <Image
        src="/Logo.svg"
        alt=""
        width={56}
        height={56}
        className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 md:h-16 md:w-16"
      />
      <span className="text-xl font-bold text-white sm:text-2xl">MeowFilms</span>
    </button>
  );
}
