import { Suspense } from "react";
import FilmsCatalog from "./components/FilmsCatalog";
import { FilmsGridSkeleton, Skeleton } from "./components/skeleton/Skeleton";

export default async function Home() {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-10 sm:gap-6 sm:px-6 lg:gap-8">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Skeleton className="h-11 w-full sm:max-w-md lg:max-w-xl" />
              <Skeleton className="h-11 w-full sm:w-40" />
            </div>
            <FilmsGridSkeleton />
          </section>
        }
      >
        <FilmsCatalog />
      </Suspense>
    </div>
  );
}
