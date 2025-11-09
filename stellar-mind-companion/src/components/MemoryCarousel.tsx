import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemoryCarouselProps {
  isVisible: boolean;
  onClose: () => void;
}

const MemoryCarousel = ({ isVisible, onClose }: MemoryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const memories = [
    {
      name: "Sarah",
      relationship: "Daughter",
      image: "/images/daughter.jpg",
      message: "I love you, Mom! We're going to lunch this Saturday.",
    },
    {
      name: "Michael",
      relationship: "Son",
      image: "/images/son.jpg",
      message: "Hi Dad! Remember we're watching the game together tomorrow.",
    },
    {
      name: "Emma",
      relationship: "Granddaughter",
      image: "/images/granddaughter.jpg",
      message: "Grandpa, I can't wait to show you my drawings!",
    },
    {
      name: "Home",
      relationship: "Your Place",
      image: "/images/home.jpg",
      message: "You live at 123 Maple Street. This is your safe space.",
    },
  ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, memories.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gradient-to-t from-space-deep via-space-deep/95 to-transparent pt-8 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-foreground">Your Loved Ones</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="relative overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 25}%)` }}
            >
              {memories.map((memory, index) => (
                <Card
                  key={index}
                  className="min-w-[calc(25%-12px)] bg-gradient-cosmic border-border p-6 rounded-xl hover:shadow-glow transition-all"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden">
                      <img 
                        src={memory.image} 
                        alt={memory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{memory.name}</h4>
                      <p className="text-sm text-primary">{memory.relationship}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{memory.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {memories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-primary w-8" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCarousel;
