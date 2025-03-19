import { z } from "zod";

// Territorio
export const Territory = z.object({
  id: z.string(),
  name: z.string(),
  points: z.number(),
  units: z.number().default(0),
  ownerId: z.string().optional()
});

export type Territory = z.infer<typeof Territory>;

// Carta
export const Card = z.object({
  id: z.string(),
  type: z.enum(["infantry", "cavalry", "artillery", "wild"]),
  territoryId: z.string().optional()
});

export type Card = z.infer<typeof Card>;

// Jugador
export const Player = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  cards: z.array(Card),
  territories: z.array(Territory),
  points: z.number()
});

export type Player = z.infer<typeof Player>;

// Partida
export const Game = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  status: z.enum(["active", "finished"]),
  players: z.array(Player),
  currentTurn: z.number()
});

export type Game = z.infer<typeof Game>;

// Schema para crear nueva partida
export const CreateGameSchema = Game.omit({ 
  id: true,
  players: true,
  currentTurn: true,
  status: true 
}).extend({
  players: z.array(z.object({
    name: z.string().min(1, "El nombre es requerido"),
    color: z.string()
  }))
});

export type CreateGame = z.infer<typeof CreateGameSchema>;