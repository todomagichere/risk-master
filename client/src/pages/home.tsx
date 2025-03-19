import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Game, CreateGameSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [games, setGames] = useState<Game[]>(storage.getAllGames());

  const form = useForm({
    resolver: zodResolver(CreateGameSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().split('T')[0],
      players: [{ name: "", color: "#ff0000" }]
    }
  });

  const onSubmit = (data: any) => {
    try {
      const game = storage.createGame(data);
      setGames(storage.getAllGames());
      toast({
        title: "¡Partida creada!",
        description: `La partida ${game.name} ha sido creada exitosamente.`
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la partida.",
        variant: "destructive"
      });
    }
  };

  const deleteGame = (id: string) => {
    try {
      storage.deleteGame(id);
      setGames(storage.getAllGames());
      toast({
        title: "Partida eliminada",
        description: "La partida ha sido eliminada exitosamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la partida.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Gestor de Partidas Risk</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Nueva Partida</h2>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la partida</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Mi partida de Risk" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="font-medium">Jugadores</h3>
                  {form.watch("players").map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`players.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input {...field} placeholder={`Jugador ${index + 1}`} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`players.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="color" {...field} className="w-12 h-10 p-1" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const players = form.getValues("players");
                      form.setValue("players", [...players, { name: "", color: "#ff0000" }]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar jugador
                  </Button>
                </div>

                <Button type="submit" className="w-full">
                  Crear Partida
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Partidas Activas</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {games.map(game => (
                <Card key={game.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        {game.players.length} jugadores
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/game/${game.id}`)}
                      >
                        Ver
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar partida?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente la partida "{game.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGame(game.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}

              {games.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No hay partidas activas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}