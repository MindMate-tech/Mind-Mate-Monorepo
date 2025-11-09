import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Clock, CheckCircle2 } from "lucide-react";

interface ExercisePanelProps {
  isVisible: boolean;
}

const ExercisePanel = ({ isVisible }: ExercisePanelProps) => {
  if (!isVisible) return null;

  const exercises = [
    {
      id: 1,
      title: "Word Recall Challenge",
      description: "Remember and repeat the following words",
      words: ["Apple", "Table", "Ocean", "Sunset"],
      difficulty: "Easy",
    },
    {
      id: 2,
      title: "Pattern Recognition",
      description: "Identify the missing pattern",
      difficulty: "Medium",
    },
    {
      id: 3,
      title: "Time Orientation",
      description: "What day is today?",
      difficulty: "Easy",
    },
  ];

  return (
    <div className="w-1/2 h-full pl-6 animate-fade-in">
      <Card className="h-full bg-card border-border p-6 rounded-2xl shadow-soft overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Cognitive Exercises</h2>
                <p className="text-sm text-muted-foreground">Personalized activities for you</p>
              </div>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <Card
                key={exercise.id}
                className="p-5 bg-gradient-cosmic border-border hover:shadow-glow transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground mb-1">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                    {exercise.difficulty}
                  </span>
                </div>

                {exercise.words && (
                  <div className="flex flex-wrap gap-2 my-4">
                    {exercise.words.map((word, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Exercise
                  </Button>
                  <Button variant="secondary" size="icon">
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Progress Summary */}
          <Card className="p-5 bg-space-light/30 border-border">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-medium text-foreground">Today's Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed exercises</span>
                <span className="text-foreground font-medium">2 of 5</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-2/5 transition-all duration-500"></div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ExercisePanel;
