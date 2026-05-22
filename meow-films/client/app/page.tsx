import { Suspense } from "react";
import FilmsCatalog from "./components/FilmsCatalog";

export default async function Home() {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <FilmsCatalog />
      </Suspense>
    </div>
  );
}
