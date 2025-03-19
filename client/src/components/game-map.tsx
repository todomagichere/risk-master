import { type Territory, type Player } from "@shared/schema";

// Organización de territorios por continente
const continents = {
  "América del Norte": [
    "alaska",
    "alberta",
    "america_central",
    "estados_unidos_orientales",
    "groenlandia",
    "territorio_noroccidental",
    "ontario",
    "quebec",
    "estados_unidos_occidentales"
  ],
  "América del Sur": [
    "argentina",
    "brasil",
    "peru",
    "venezuela"
  ],
  "Europa": [
    "gran_bretana",
    "islandia",
    "europa_del_norte",
    "escandinavia",
    "europa_del_sur",
    "ucrania",
    "europa_occidental"
  ]
};

interface GameMapProps {
  players: Player[];
}

export function GameMap({ players }: GameMapProps) {
  // Crear un mapa de territorios y sus dueños
  const territoryOwners = new Map<string, Player>();
  players.forEach(player => {
    player.territories.forEach(territory => {
      territoryOwners.set(territory.id, player);
    });
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Mapa de Territorios</h2>
      <div className="space-y-6">
        {Object.entries(continents).map(([continent, territories]) => (
          <div key={continent}>
            <h3 className="font-semibold mb-2">{continent}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {territories.map(territoryId => {
                const owner = territoryOwners.get(territoryId);
                const territory = owner?.territories.find(t => t.id === territoryId);
                
                return (
                  <div
                    key={territoryId}
                    className="p-3 rounded border"
                    style={{
                      backgroundColor: owner ? `${owner.color}20` : 'transparent',
                      borderColor: owner ? owner.color : '#e5e7eb',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {territory?.name || territoryId.replace(/_/g, ' ')}
                      </span>
                      {territory?.units ? (
                        <span className="text-xs font-semibold bg-white px-2 py-1 rounded">
                          {territory.units}
                        </span>
                      ) : null}
                    </div>
                    {owner && (
                      <div className="text-xs mt-1 flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: owner.color }}
                        />
                        {owner.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
