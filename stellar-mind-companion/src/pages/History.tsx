import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Brain, Video, FileText, Download } from "lucide-react";

const historyItems = [
  {
    id: 1,
    type: "assessment",
    title: "Initial Cognitive Assessment",
    date: "2025-01-10",
    time: "10:00 AM",
    score: 78,
    status: "completed"
  },
  {
    id: 2,
    type: "exercise",
    title: "Memory Training - Level 3",
    date: "2025-01-12",
    time: "2:30 PM",
    score: 85,
    status: "completed"
  },
  {
    id: 3,
    type: "consultation",
    title: "Video Session with Dr. Smith",
    date: "2025-01-13",
    time: "11:00 AM",
    duration: "45 min",
    status: "completed"
  },
  {
    id: 4,
    type: "exercise",
    title: "Pattern Recognition Challenge",
    date: "2025-01-14",
    time: "3:00 PM",
    score: 92,
    status: "completed"
  }
];

export default function History() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activity History</h1>
            <p className="text-muted-foreground">
              Review your past sessions and progress
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {historyItems.map((item) => (
              <Card key={item.id} className="border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        {item.type === "assessment" && <Brain className="w-5 h-5 text-primary" />}
                        {item.type === "exercise" && <Brain className="w-5 h-5 text-primary" />}
                        {item.type === "consultation" && <Video className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </div>
                          {item.score && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-primary">Score: {item.score}/100</span>
                            </>
                          )}
                          {item.duration && (
                            <>
                              <span>•</span>
                              <span>Duration: {item.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{item.status}</Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4 mt-6">
            {historyItems.filter(item => item.type === "assessment").map((item) => (
              <Card key={item.id} className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleDateString()} • {item.time} • Score: {item.score}/100
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Report</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4 mt-6">
            {historyItems.filter(item => item.type === "exercise").map((item) => (
              <Card key={item.id} className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleDateString()} • {item.time} • Score: {item.score}/100
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Retry</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="consultations" className="space-y-4 mt-6">
            {historyItems.filter(item => item.type === "consultation").map((item) => (
              <Card key={item.id} className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleDateString()} • {item.time} • {item.duration}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Notes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
