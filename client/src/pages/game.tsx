import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Game, Player, Territory } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Save, MinusCircle, Trophy, Flag, Shield, Sword } from "lucide-react";
import { GameMap } from "@/components/game-map";

export default function GamePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [game, setGame] = useState<Game>();
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [availableTerritories, setAvailableTerritories] = useState<Territory[]>([]);

  useEffect(() => {
    const loadedGame = storage.getGame(params.id);
    if (!loadedGame) {
      toast({
        title: "Error",
        description: "Partida no encontrada",
        variant: "destructive"
      });
      setLocation("/");
      return;
    }
    setGame(loadedGame);
    setEditedName(loadedGame.name);
    setAvailableTerritories(storage.getAvailableTerritories(loadedGame.id));
  }, [params.id]);

  if (!game) return null;

  const addCard = (player: Player, type: "infantry" | "cavalry" | "artillery" | "wild") => {
    try {
      const updatedGame = storage.addCard(game.id, player.id, type);
      setGame(updatedGame);

      toast({
        title: "¡Carta agregada!",
        description: `Se agregó una carta de ${type} a ${player.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar la carta",
        variant: "destructive"
      });
    }
  };

  const removeCard = (player: Player, cardId: string) => {
    try {
      const updatedGame = storage.removeCard(game.id, player.id, cardId);
      setGame(updatedGame);

      toast({
        title: "Carta eliminada",
        description: `Se eliminó la carta de ${player.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la carta",
        variant: "destructive"
      });
    }
  };

  const assignTerritory = async (player: Player, territoryId: string) => {
    try {
      const updatedGame = storage.assignTerritory(game.id, player.id, territoryId);
      setGame(updatedGame);
      setAvailableTerritories(storage.getAvailableTerritories(game.id));

      toast({
        title: "¡Territorio asignado!",
        description: `Territorio asignado a ${player.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar el territorio",
        variant: "destructive"
      });
    }
  };

  const removeTerritory = (player: Player, territoryId: string) => {
    try {
      const updatedGame = storage.removeTerritory(game.id, player.id, territoryId);
      setGame(updatedGame);
      setAvailableTerritories(storage.getAvailableTerritories(game.id));

      toast({
        title: "Territorio removido",
        description: `Territorio removido de ${player.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo remover el territorio",
        variant: "destructive"
      });
    }
  };

  const updateTerritoryUnits = (territoryId: string, units: number) => {
    try {
      const updatedGame = storage.updateTerritoryUnits(game.id, territoryId, units);
      setGame(updatedGame);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar las unidades",
        variant: "destructive"
      });
    }
  };

  const saveChanges = () => {
    try {
      const updatedGame = storage.updateGame({
        ...game,
        name: editedName
      });
      setGame(updatedGame);
      setEditMode(false);
      toast({
        title: "¡Cambios guardados!",
        description: "Los datos de la partida han sido actualizados"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    }
  };

  const updateGameStatus = (status: "active" | "finished") => {
    try {
      const updatedGame = storage.updateGame({
        ...game,
        status
      });
      setGame(updatedGame);
      toast({
        title: "¡Estado actualizado!",
        description: `La partida ahora está ${status === "active" ? "activa" : "finalizada"}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const updateTurn = () => {
    try {
      const nextTurn = (game.currentTurn + 1) % game.players.length;
      const updatedGame = storage.updateGame({
        ...game,
        currentTurn: nextTurn
      });
      setGame(updatedGame);
      toast({
        title: "¡Turno actualizado!",
        description: `Turno de ${game.players[nextTurn].name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el turno",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {editMode ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-64"
            />
            <Button onClick={saveChanges}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button variant="ghost" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold">{game.name}</h1>
            <Button variant="outline" onClick={() => setEditMode(true)}>
              Editar
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Select value={game.status} onValueChange={updateGameStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="finished">Finalizada</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={updateTurn}>
            Siguiente turno ({game.players[game.currentTurn].name})
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {game.players.map(player => (
          <Card
            key={player.id}
            className={player.id === game.players[game.currentTurn].id ? "ring-2 ring-primary" : ""}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <h2 className="text-xl font-semibold">{player.name}</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">
                    Cartas ({player.cards.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {player.cards.map(card => (
                      <div
                        key={card.id}
                        className="px-3 py-1 bg-muted rounded-md text-sm flex items-center gap-2"
                      >
                        {card.type}
                        <button
                          onClick={() => removeCard(player, card.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Select onValueChange={(value) => addCard(player, value as any)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Agregar carta..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infantry">Infantería</SelectItem>
                        <SelectItem value="cavalry">Caballería</SelectItem>
                        <SelectItem value="artillery">Artillería</SelectItem>
                        <SelectItem value="wild">Comodín</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    Territorios ({player.territories.length})
                  </h3>
                  <div className="space-y-2">
                    {player.territories.map(territory => (
                      <div
                        key={territory.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div>
                          <p className="font-medium">{territory.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTerritoryUnits(territory.id, Math.max(0, territory.units - 1))}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={territory.units}
                              onChange={(e) => updateTerritoryUnits(territory.id, Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-20 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTerritoryUnits(territory.id, territory.units + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTerritory(player, territory.id)}
                          >
                            <MinusCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {availableTerritories.length > 0 && (
                      <Select onValueChange={(value) => assignTerritory(player, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Asignar territorio..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTerritories.map(territory => (
                            <SelectItem key={territory.id} value={territory.id}>
                              {territory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium">
                    Puntos totales: {player.points}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <GameMap players={game.players} />
      </div>
    </div>
  );
}