import { Suspense } from "react";
import FilmsCatalog from "./components/FilmsCatalog";

export default async function Home() {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <FilmsCatalog />
      </Suspense>
    </div>
  );
}
