
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card as GameCard } from "@shared/schema"
import { MinusCircle, Swords, Users, Shield, Target } from "lucide-react"

interface CardCarouselProps {
  cards: GameCard[]
  onRemove: (cardId: string) => void
}

export function CardCarousel({ cards, onRemove }: CardCarouselProps) {
  return (
    <Carousel className="w-full perspective-1000 overflow-visible">
      <CarouselContent className="-ml-2 -mr-2">
        {cards.map(card => (
          <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/3 card-slide">
            <Card className="bg-muted/50 relative overflow-hidden group transform-gpu hover:scale-105 transition-transform duration-300">
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => onRemove(card.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                </div>
                {card.type === 'cavalry' && <Shield className="h-16 w-16 mb-4 text-primary" />}
                {card.type === 'artillery' && <Target className="h-16 w-16 mb-4 text-primary" />}
                {card.type === 'infantry' && <Users className="h-16 w-16 mb-4 text-primary" />}
                {card.type === 'wildcard' && <Swords className="h-16 w-16 mb-4 text-primary" />}
                <span className="capitalize font-medium">{card.type}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
