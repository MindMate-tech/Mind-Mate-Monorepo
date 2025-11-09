import { X, Brain, Activity, Music, Users, Clock, Heart, Book, Utensils, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Exercise {
  id: number;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  duration: string;
  frequency: string;
  icon: any;
  benefits: string[];
  instructions: string[];
  tips: string[];
  materials?: string[];
}

const exercises: Exercise[] = [
  {
    id: 1,
    title: "Memory Photo Album Review",
    category: "Memory",
    difficulty: "Easy",
    duration: "15-20 minutes",
    frequency: "Daily",
    icon: Book,
    benefits: [
      "Stimulates long-term memory recall",
      "Encourages storytelling and verbal expression",
      "Provides emotional comfort through familiar faces",
      "Strengthens sense of identity and personal history"
    ],
    instructions: [
      "Gather a collection of family photos from different life periods",
      "Sit in a comfortable, well-lit space with minimal distractions",
      "Look through 5-10 photos, one at a time",
      "For each photo, identify the people, place, and approximate time period",
      "Share a memory or story associated with the photo",
      "Write down or record the stories shared to preserve them"
    ],
    tips: [
      "Use photos with clear, recognizable faces",
      "Start with recent photos and gradually move to older ones",
      "Don't rush - allow plenty of time for reminiscence",
      "If memory is difficult, provide gentle prompts about the context",
      "Focus on positive memories and emotions"
    ],
    materials: ["Photo albums", "Family photographs", "Notebook for recording memories"]
  },
  {
    id: 2,
    title: "Name That Tune - Music Memory",
    category: "Cognitive",
    difficulty: "Easy",
    duration: "20-30 minutes",
    frequency: "3-4 times per week",
    icon: Music,
    benefits: [
      "Activates multiple brain regions simultaneously",
      "Accesses deeply embedded musical memories",
      "Improves mood and reduces anxiety",
      "Encourages movement and physical engagement"
    ],
    instructions: [
      "Create a playlist of songs from the person's youth (ages 15-25 are most memorable)",
      "Play 10-15 seconds of each song",
      "Ask them to identify the song title, artist, or sing along",
      "Discuss memories associated with each song",
      "Encourage gentle movement like clapping, swaying, or dancing",
      "Sing favorite songs together"
    ],
    tips: [
      "Choose music from their favorite genres and eras",
      "Keep volume moderate and comfortable",
      "Watch for emotional responses - music can evoke strong feelings",
      "Use live performances or original recordings when possible",
      "Make it interactive - use simple instruments like tambourines"
    ],
    materials: ["Music player", "Curated playlist", "Simple instruments (optional)"]
  },
  {
    id: 3,
    title: "Daily Living Skills Practice",
    category: "Functional",
    difficulty: "Easy",
    duration: "10-15 minutes",
    frequency: "Daily",
    icon: Utensils,
    benefits: [
      "Maintains independence in daily activities",
      "Provides sense of purpose and accomplishment",
      "Exercises fine motor skills",
      "Reinforces procedural memory"
    ],
    instructions: [
      "Choose a familiar daily task (folding laundry, setting table, sorting items)",
      "Break the task into simple, clear steps",
      "Demonstrate each step if needed",
      "Allow the person to complete the task at their own pace",
      "Provide gentle guidance only when necessary",
      "Offer specific praise for each completed step"
    ],
    tips: [
      "Select tasks that were once routine for the person",
      "Use real objects rather than simulated activities",
      "Focus on the process, not perfection",
      "Adapt difficulty based on current abilities",
      "Celebrate small successes"
    ],
    materials: ["Household items relevant to the chosen task"]
  },
  {
    id: 4,
    title: "Gentle Chair Exercises",
    category: "Physical",
    difficulty: "Easy",
    duration: "15-20 minutes",
    frequency: "Daily",
    icon: Activity,
    benefits: [
      "Improves blood flow to the brain",
      "Maintains muscle strength and flexibility",
      "Reduces risk of falls",
      "Enhances mood and energy levels",
      "Supports better sleep quality"
    ],
    instructions: [
      "Sit in a sturdy chair with feet flat on the floor",
      "Warm up: 5 minutes of gentle neck rolls and shoulder shrugs",
      "Arm circles: 10 forward, 10 backward",
      "Seated marching: Lift knees alternately for 1 minute",
      "Ankle rotations: 10 circles each direction, both feet",
      "Seated twists: Gentle torso rotation, holding for 5 seconds each side",
      "Cool down: Deep breathing and gentle stretching"
    ],
    tips: [
      "Ensure the chair is stable and has no wheels",
      "Start slowly and gradually increase repetitions",
      "Never force movements - stop if there's pain",
      "Breathe normally throughout exercises",
      "Exercise to favorite music for added enjoyment",
      "Keep water nearby for hydration"
    ],
    materials: ["Sturdy chair without wheels", "Comfortable clothing", "Water"]
  },
  {
    id: 5,
    title: "Sensory Stimulation Garden",
    category: "Sensory",
    difficulty: "Easy",
    duration: "20-30 minutes",
    frequency: "3-4 times per week",
    icon: Heart,
    benefits: [
      "Engages multiple senses simultaneously",
      "Reduces agitation and anxiety",
      "Provides meaningful activity and purpose",
      "Connects with nature and seasonal changes",
      "Encourages gentle physical movement"
    ],
    instructions: [
      "Create or visit a safe outdoor space with plants",
      "Touch and feel different textures: soft leaves, rough bark, smooth petals",
      "Smell aromatic herbs like lavender, rosemary, or mint",
      "Listen to natural sounds: birds, wind, water features",
      "Observe colors, shapes, and movement in nature",
      "Engage in simple gardening tasks: watering, deadheading, planting",
      "Discuss memories associated with plants and gardens"
    ],
    tips: [
      "Choose non-toxic, safe plants",
      "Provide seating for rest periods",
      "Protect from extreme weather",
      "Use raised beds for easier access",
      "Include familiar plants from their past"
    ],
    materials: ["Garden space or potted plants", "Gardening gloves", "Watering can", "Safe gardening tools"]
  },
  {
    id: 6,
    title: "Sorting and Categorizing Activities",
    category: "Cognitive",
    difficulty: "Easy",
    duration: "15-25 minutes",
    frequency: "3-4 times per week",
    icon: Brain,
    benefits: [
      "Exercises categorization and reasoning skills",
      "Provides sense of order and accomplishment",
      "Improves focus and attention span",
      "Offers tactile stimulation"
    ],
    instructions: [
      "Gather objects to sort: buttons, coins, photos, playing cards, or colored items",
      "Start with 2-3 categories (e.g., colors, sizes, types)",
      "Demonstrate the sorting criteria with a few examples",
      "Allow them to sort at their own pace",
      "Discuss the categories and why items belong together",
      "Gradually introduce new sorting challenges if appropriate"
    ],
    tips: [
      "Use objects that are meaningful or familiar",
      "Ensure items are safe and easy to handle",
      "Start simple and increase complexity gradually",
      "Make it a social activity by doing it together",
      "Accept their sorting logic even if different from yours"
    ],
    materials: ["Collection of safe objects to sort", "Containers or sorting trays"]
  },
  {
    id: 7,
    title: "Reminiscence Conversation Topics",
    category: "Social",
    difficulty: "Easy",
    duration: "20-30 minutes",
    frequency: "Daily",
    icon: Users,
    benefits: [
      "Strengthens communication and social connection",
      "Validates life experiences and identity",
      "Reduces feelings of isolation",
      "Stimulates verbal expression and language skills"
    ],
    instructions: [
      "Choose a topic from their past: childhood, first job, wedding, holidays, etc.",
      "Ask open-ended questions to encourage storytelling",
      "Show genuine interest and active listening",
      "Use prompts like photos, objects, or music related to the topic",
      "Allow pauses and don't rush responses",
      "Record or write down stories shared"
    ],
    tips: [
      "Focus on positive memories and happy times",
      "Use all five senses in questions (What did it smell like? What sounds?)",
      "Be patient if stories are repeated - they're still meaningful",
      "Avoid correcting minor factual errors unless important",
      "Share your own related memories to encourage reciprocal conversation"
    ],
    materials: ["Conversation prompt cards", "Memory aids (photos, objects)", "Recording device (optional)"]
  },
  {
    id: 8,
    title: "Simple Puzzle Completion",
    category: "Cognitive",
    difficulty: "Medium",
    duration: "20-30 minutes",
    frequency: "4-5 times per week",
    icon: Star,
    benefits: [
      "Exercises visual-spatial reasoning",
      "Improves problem-solving skills",
      "Enhances concentration and patience",
      "Provides clear sense of achievement"
    ],
    instructions: [
      "Select a puzzle with 12-50 large pieces and a familiar, clear image",
      "Work in good lighting on a contrasting surface",
      "Start by identifying edge pieces together",
      "Sort pieces by color or pattern",
      "Complete one section at a time",
      "Offer encouragement and gentle guidance as needed",
      "Leave partially completed puzzles out to continue later"
    ],
    tips: [
      "Choose images with personal meaning or interest",
      "Start with fewer pieces and gradually increase difficulty",
      "Use puzzle boards for easy storage between sessions",
      "Work together rather than taking over",
      "Celebrate completion with a photo of the finished puzzle"
    ],
    materials: ["Large-piece puzzles", "Puzzle board or flat surface", "Good lighting"]
  },
  {
    id: 9,
    title: "Orientation Reality Check",
    category: "Cognitive",
    difficulty: "Easy",
    duration: "5-10 minutes",
    frequency: "Multiple times daily",
    icon: Clock,
    benefits: [
      "Maintains awareness of time, place, and person",
      "Reduces confusion and anxiety",
      "Provides structure and routine",
      "Reinforces important information"
    ],
    instructions: [
      "Create a large, visible orientation board with: today's date, day of week, season, weather, location",
      "Review the board together each morning",
      "Discuss upcoming activities for the day",
      "Point out environmental cues: windows for weather, clocks for time",
      "Use calendars to mark important dates and appointments",
      "Incorporate orientation into natural conversation throughout the day"
    ],
    tips: [
      "Keep the board in a central, frequently visited location",
      "Use large, clear fonts and high contrast colors",
      "Include familiar photos of family members with names",
      "Update daily to ensure accuracy",
      "Be patient with repeated questions about orientation"
    ],
    materials: ["Large orientation board or calendar", "Markers", "Photos", "Clocks"]
  },
  {
    id: 10,
    title: "Meaningful Work Activities",
    category: "Functional",
    difficulty: "Medium",
    duration: "30-45 minutes",
    frequency: "3-4 times per week",
    icon: Activity,
    benefits: [
      "Provides sense of purpose and contribution",
      "Utilizes long-standing skills and expertise",
      "Maintains self-esteem and dignity",
      "Offers productive engagement"
    ],
    instructions: [
      "Identify activities related to past work, hobbies, or interests",
      "Examples: office work (filing, stamping), crafts, cooking, woodworking (safe tools only)",
      "Set up a dedicated workspace with necessary materials",
      "Explain how their work is helpful and valued",
      "Allow them to work at their own pace without pressure",
      "Display or use completed work to show appreciation"
    ],
    tips: [
      "Adapt activities to current ability levels",
      "Focus on familiar tasks from their past",
      "Ensure all materials and tools are safe",
      "Avoid time pressure or deadlines",
      "Offer genuine, specific praise for contributions"
    ],
    materials: ["Materials specific to chosen activity", "Safe, appropriate tools"]
  }
];

interface DementiaExercisesProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DementiaExercises({ isVisible, onClose }: DementiaExercisesProps) {
  if (!isVisible) return null;

  const categories = ["All", "Memory", "Cognitive", "Physical", "Functional", "Social", "Sensory"];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 animate-fade-in">
      <div className="container mx-auto h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              Dementia & Alzheimer's Exercise Guide
            </h2>
            <p className="text-muted-foreground mt-2">
              Evidence-based, practical activities to support cognitive health and daily living
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Tabs for Categories */}
        <Tabs defaultValue="All" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="flex-1">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4">
                  {exercises
                    .filter((ex) => category === "All" || ex.category === category)
                    .map((exercise) => (
                      <Card key={exercise.id} className="border-primary/20 bg-card/80 backdrop-blur">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-3 rounded-lg bg-primary/10">
                                <exercise.icon className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-xl">{exercise.title}</CardTitle>
                                <CardDescription className="mt-1">{exercise.category}</CardDescription>
                              </div>
                            </div>
                            <Badge variant={
                              exercise.difficulty === "Easy" ? "secondary" :
                              exercise.difficulty === "Medium" ? "default" : "destructive"
                            }>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Duration & Frequency */}
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{exercise.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{exercise.frequency}</span>
                            </div>
                          </div>

                          {/* Benefits */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-foreground">Benefits:</h4>
                            <ul className="space-y-1">
                              {exercise.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-foreground">Step-by-Step Instructions:</h4>
                            <ol className="space-y-2">
                              {exercise.instructions.map((instruction, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                                  <span className="font-semibold text-primary">{idx + 1}.</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Materials (if any) */}
                          {exercise.materials && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-foreground">Materials Needed:</h4>
                              <div className="flex flex-wrap gap-2">
                                {exercise.materials.map((material, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-foreground">Helpful Tips:</h4>
                            <ul className="space-y-1">
                              {exercise.tips.map((tip, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">→</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
