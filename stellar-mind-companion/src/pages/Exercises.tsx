import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Zap, Clock, Trophy } from "lucide-react";

const exercises = [
  {
    id: 1,
    title: "Memory Match",
    description: "Test your memory by matching pairs of cards",
    difficulty: "Easy",
    duration: "5 min",
    icon: Brain,
    color: "text-blue-500"
  },
  {
    id: 2,
    title: "Pattern Recognition",
    description: "Identify and continue visual patterns",
    difficulty: "Medium",
    duration: "10 min",
    icon: Target,
    color: "text-purple-500"
  },
  {
    id: 3,
    title: "Quick Recall",
    description: "Remember and recall sequences of numbers",
    difficulty: "Medium",
    duration: "8 min",
    icon: Zap,
    color: "text-yellow-500"
  },
  {
    id: 4,
    title: "Word Association",
    description: "Connect words based on their relationships",
    difficulty: "Easy",
    duration: "7 min",
    icon: Brain,
    color: "text-green-500"
  },
  {
    id: 5,
    title: "Speed Challenge",
    description: "Quick decision-making exercises",
    difficulty: "Hard",
    duration: "12 min",
    icon: Clock,
    color: "text-red-500"
  },
  {
    id: 6,
    title: "Master Challenge",
    description: "Advanced cognitive training exercises",
    difficulty: "Expert",
    duration: "15 min",
    icon: Trophy,
    color: "text-orange-500"
  }
];

export default function Exercises() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cognitive Exercises</h1>
          <p className="text-muted-foreground">
            Choose an exercise to improve your cognitive abilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-muted/50 ${exercise.color}`}>
                    <exercise.icon className="w-6 h-6" />
                  </div>
                  <Badge variant={
                    exercise.difficulty === "Easy" ? "secondary" :
                    exercise.difficulty === "Medium" ? "default" :
                    exercise.difficulty === "Hard" ? "destructive" : "outline"
                  }>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{exercise.duration}</span>
                </div>
                <Button className="w-full">Start Exercise</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
