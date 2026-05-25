import { getFilmById, pickYouTubeTrailerSrc } from "@/lib/films";
import Image from "next/image";
import ReactPlayer from "react-player";
import { CreateRoomButton } from "@/app/components/CreateRoom";

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const film = await getFilmById(id);
  const trailerSrc = pickYouTubeTrailerSrc(film);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <section className="relative isolate overflow-hidden">
        {film.backdrop_path ? (
          <div className="absolute inset-0 -z-10">
            <Image
              src={`https://image.tmdb.org/t/p/w1280${film.backdrop_path}`}
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-transparent to-slate-950/60" />
          </div>
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0d1b2a] via-slate-900 to-[#1b263b]" />
        )}

        <div className="container mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-10">
            <div className="relative aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 sm:w-52 md:w-56">
              {film.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                  alt={film.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 11rem, 14rem"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-center text-sm text-slate-400">
                  No poster
                </div>
              )}
            </div>

            <div className="w-full max-w-2xl flex-1 text-center md:text-left">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
                {film.title}
              </h1>
              {film.tagline ? (
                <p className="mt-3 text-sm italic text-[#c38eb4]/90 sm:text-base">
                  {film.tagline}
                </p>
              ) : null}

              <p className="mt-6 text-pretty leading-relaxed text-slate-300 sm:text-lg">
                {film.overview || "Description not available."}
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8 items-center justify-center">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm">
              <div className="aspect-video w-full">
                {trailerSrc ? (
                  <ReactPlayer
                    src={trailerSrc}
                    controls
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 bg-slate-900/80 px-6 text-center text-slate-500">
                    <p className="text-sm">Trailer not available</p>
                    <p className="max-w-xs text-xs text-slate-600">
                      TMDB has no YouTube trailer for this title.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">Watch together</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Create a room and invite friends — synchronous viewing in Meow
              Cinema.
            </p>
            <div className="mt-6 flex justify-center ">
              <CreateRoomButton
                movieId={id}
                movieTitle={film.title}
                moviePoster={film.poster_path}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
