export async function getFilmsBySearch(query: string, page: number = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_ACCESS_TOKEN}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch films by search");
  }
  const data = await res.json();
  return data;
}

export default async function getFilms(
  category: "popular" | "top_rated" | "upcoming" | "now_playing",
  page: number = 1,
) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${category}?page=${page}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_ACCESS_TOKEN}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch films");
  }
  const data = await res.json();
  return data;
}

export async function getFilmById(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?append_to_response=videos,images`,
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_ACCESS_TOKEN}`,
      },
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch film");
  }
  const data = await res.json();
  return data;
}
