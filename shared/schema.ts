
import { z } from "zod";

export const GameType = z.enum(["secret_mission", "classic", "two_players", "capital"]);

export const TroopType = z.enum(["infantry", "artillery"]);

export const CardType = z.enum(["infantry", "cavalry", "artillery", "wild"]);

export const Territory = z.object({
  id: z.string(),
  name: z.string(),
  continent: z.string(),
  troops: z.array(z.object({
    type: TroopType,
    quantity: z.number(),
  })),
  ownerId: z.string().optional(),
  isHeadquarters: z.boolean().optional(),
  adjacentTerritories: z.array(z.string())
});

export const Card = z.object({
  id: z.string(),
  type: CardType,
  territoryId: z.string().optional()
});

export const Battle = z.object({
  id: z.string(),
  turnId: z.string(),
  attackerId: z.string(),
  defenderId: z.string(),
  fromTerritoryId: z.string(),
  toTerritoryId: z.string(),
  attackerDice: z.array(z.number()),
  defenderDice: z.array(z.number()),
  troopsLostAttacker: z.number(),
  troopsLostDefender: z.number(),
  territoryConquered: z.boolean()
});

export const Turn = z.object({
  id: z.string(),
  playerId: z.string(),
  reinforcements: z.number(),
  battles: z.array(Battle),
  cardDrawn: z.boolean().default(false),
  cardsTraded: z.boolean().default(false)
});

export const Player = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  cards: z.array(Card),
  mission: z.string().optional(),
  eliminated: z.boolean().default(false)
});

export const Game = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  type: GameType,
  status: z.enum(["setup", "active", "finished"]),
  players: z.array(Player),
  currentTurn: z.number(),
  turns: z.array(Turn),
  cardsTraded: z.number().default(0)
});

export type Territory = z.infer<typeof Territory>;
export type Card = z.infer<typeof Card>;
export type Battle = z.infer<typeof Battle>;
export type Turn = z.infer<typeof Turn>;
export type Player = z.infer<typeof Player>;
export type Game = z.infer<typeof Game>;

export const CreateGameSchema = Game.omit({ 
  id: true,
  players: true,
  currentTurn: true,
  status: true,
  turns: true,
  cardsTraded: true
}).extend({
  players: z.array(z.object({
    name: z.string().min(1, "El nombre es requerido"),
    color: z.string()
  }))
});

export type CreateGame = z.infer<typeof CreateGameSchema>;
