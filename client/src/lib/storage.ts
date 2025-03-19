import { Game, Player, Card, Territory, CreateGame } from "@shared/schema";
import { nanoid } from "nanoid";

const STORAGE_KEY = "risk_games";

const defaultTerritories: Territory[] = [
  { id: "alaska", name: "Alaska", points: 1, units: 0 },
  { id: "alberta", name: "Alberta", points: 1, units: 0 },
  { id: "america_central", name: "América Central", points: 1, units: 0 },
  { id: "estados_unidos_orientales", name: "Estados Unidos Orientales", points: 1, units: 0 },
  { id: "groenlandia", name: "Groenlandia", points: 1, units: 0 },
  { id: "territorio_noroccidental", name: "Territorio Noroccidental", points: 1, units: 0 },
  { id: "ontario", name: "Ontario", points: 1, units: 0 },
  { id: "quebec", name: "Quebec", points: 1, units: 0 },
  { id: "estados_unidos_occidentales", name: "Estados Unidos Occidentales", points: 1, units: 0 },
  // Sudamérica
  { id: "argentina", name: "Argentina", points: 1, units: 0 },
  { id: "brasil", name: "Brasil", points: 2, units: 0 },
  { id: "peru", name: "Perú", points: 1, units: 0 },
  { id: "venezuela", name: "Venezuela", points: 1, units: 0 },
  // Europa
  { id: "gran_bretana", name: "Gran Bretaña", points: 2, units: 0 },
  { id: "islandia", name: "Islandia", points: 1, units: 0 },
  { id: "europa_del_norte", name: "Europa del Norte", points: 2, units: 0 },
  { id: "escandinavia", name: "Escandinavia", points: 2, units: 0 },
  { id: "europa_del_sur", name: "Europa del Sur", points: 2, units: 0 },
  { id: "ucrania", name: "Ucrania", points: 2, units: 0 },
  { id: "europa_occidental", name: "Europa Occidental", points: 2, units: 0 }
];

class LocalStorage {
  private getGames(): Game[] {
    const games = localStorage.getItem(STORAGE_KEY);
    return games ? JSON.parse(games) : [];
  }

  private saveGames(games: Game[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  }

  createGame(data: CreateGame): Game {
    const games = this.getGames();

    const players: Player[] = data.players.map(p => ({
      id: nanoid(),
      name: p.name,
      color: p.color,
      cards: [],
      territories: [],
      points: 0
    }));

    const newGame: Game = {
      id: nanoid(),
      name: data.name,
      date: data.date,
      status: "active",
      players,
      currentTurn: 0
    };

    games.push(newGame);
    this.saveGames(games);
    return newGame;
  }

  getGame(id: string): Game | undefined {
    return this.getGames().find(g => g.id === id);
  }

  updateGame(game: Game): Game {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === game.id);
    if (index === -1) throw new Error("Partida no encontrada");

    games[index] = game;
    this.saveGames(games);
    return game;
  }

  deleteGame(id: string): void {
    const games = this.getGames().filter(g => g.id !== id);
    this.saveGames(games);
  }

  getAllGames(): Game[] {
    return this.getGames();
  }

  addCard(gameId: string, playerId: string, type: "infantry" | "cavalry" | "artillery" | "wild"): Game {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    const card: Card = {
      id: nanoid(),
      type,
    };

    player.cards.push(card);
    return this.updateGame(game);
  }

  removeCard(gameId: string, playerId: string, cardId: string): Game {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    player.cards = player.cards.filter(c => c.id !== cardId);
    return this.updateGame(game);
  }

  assignTerritory(gameId: string, playerId: string, territoryId: string): Game {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    const territory = defaultTerritories.find(t => t.id === territoryId);
    if (!territory) throw new Error("Territorio no encontrado");

    // Verificar si el territorio ya está asignado a otro jugador
    const isAssigned = game.players.some(p => 
      p.territories.some(t => t.id === territoryId)
    );
    if (isAssigned) throw new Error("Territorio ya asignado");

    player.territories.push({...territory, ownerId: playerId});
    player.points = player.territories.reduce((sum, t) => sum + t.points, 0);

    return this.updateGame(game);
  }

  removeTerritory(gameId: string, playerId: string, territoryId: string): Game {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error("Jugador no encontrado");

    player.territories = player.territories.filter(t => t.id !== territoryId);
    player.points = player.territories.reduce((sum, t) => sum + t.points, 0);

    return this.updateGame(game);
  }

  updateTerritoryUnits(gameId: string, territoryId: string, units: number): Game {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    for (const player of game.players) {
      const territory = player.territories.find(t => t.id === territoryId);
      if (territory) {
        territory.units = units;
        break;
      }
    }

    return this.updateGame(game);
  }

  getAvailableTerritories(gameId: string): Territory[] {
    const game = this.getGame(gameId);
    if (!game) throw new Error("Partida no encontrada");

    const assignedTerritoryIds = new Set(
      game.players.flatMap(p => p.territories.map(t => t.id))
    );

    return defaultTerritories.filter(t => !assignedTerritoryIds.has(t.id));
  }
}

export const storage = new LocalStorage();