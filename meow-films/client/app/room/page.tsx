import Link from "next/link";

export default function RoomIndexPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="max-w-md rounded-2xl border border-white/10 bg-gray-800/40 p-8 text-center shadow-xl ring-1 ring-white/5 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-white">Rooms</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Open the room by the link from the main page or create it from the
          movie page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#c38eb4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b37eb4]"
        >
          To the main page
        </Link>
      </div>
    </div>
  );
}
