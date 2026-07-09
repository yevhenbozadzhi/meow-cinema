import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md bg-white/10",
        className,
      )}
    />
  );
}

export function FilmCardSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-gray-900/55 p-3 shadow-lg backdrop-blur-sm sm:p-4">
      <Skeleton className="mx-auto h-12 w-4/5 rounded-md" />
      <Skeleton className="mt-2 mb-4 aspect-[2/3] w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export function FilmsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <FilmCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-10">
      <Skeleton className="h-40 w-40 shrink-0 rounded-full" />
      <Skeleton className="mt-4 h-8 w-40 rounded-md" />
      <Skeleton className="mt-2 h-4 w-52 rounded-md" />
      <div className="mt-8 w-full max-w-5xl">
        <Skeleton className="mb-4 h-7 w-36 rounded-md" />
        <FavoritesSkeleton />
      </div>
    </div>
  );
}

export function FavoritesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg bg-gray-800/50 p-3 sm:p-4"
        >
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Skeleton className="h-3 flex-1 rounded-md" />
            <Skeleton className="h-3 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-800/40 shadow-xl ring-1 ring-white/5">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export function RoomsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <RoomCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function RoomPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <div className="border-b border-white/5 bg-slate-950/75 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-10 pt-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-end">
          <Skeleton className="aspect-[2/3] w-44 shrink-0 rounded-2xl sm:w-52 md:w-56" />
          <div className="w-full max-w-2xl flex-1 space-y-3 text-center md:text-left">
            <Skeleton className="mx-auto h-3 w-24 rounded-md md:mx-0" />
            <Skeleton className="mx-auto h-10 w-4/5 rounded-md md:mx-0" />
            <Skeleton className="mx-auto h-4 w-48 rounded-md md:mx-0" />
            <div className="flex justify-center gap-2 pt-2 md:justify-start">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <Skeleton className="aspect-video rounded-2xl lg:col-span-3" />
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MoviePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <div className="container mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-10">
          <Skeleton className="aspect-[2/3] w-44 shrink-0 rounded-2xl sm:w-52 md:w-56" />
          <div className="w-full max-w-2xl flex-1 space-y-3">
            <Skeleton className="h-10 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="mt-4 h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <Skeleton className="aspect-video rounded-2xl lg:col-span-3" />
          <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton({ align = "left" }: { align?: "left" | "right" }) {
  return (
    <div
      className={`flex w-full ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <Skeleton
        className={`h-14 rounded-2xl ${
          align === "right" ? "w-[70%] rounded-br-sm" : "w-[80%] rounded-bl-sm"
        }`}
      />
    </div>
  );
}

export function NavAuthSkeleton() {
  return <Skeleton className="h-10 w-24 rounded-md" />;
}
