import { z } from "zod";

export const createRoomSchema = z.object({
  movieId: z.string().min(1),
  movieTitle: z.string().min(1),
  moviePoster: z.string().optional().nullable(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});
