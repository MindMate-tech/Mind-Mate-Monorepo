import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Plus, Brain, Video } from "lucide-react";

const upcomingSessions = [
  {
    id: 1,
    title: "Cognitive Assessment",
    type: "assessment",
    date: "2025-01-15",
    time: "10:00 AM",
    duration: "30 min",
    status: "upcoming"
  },
  {
    id: 2,
    title: "Memory Training Session",
    type: "exercise",
    date: "2025-01-16",
    time: "2:00 PM",
    duration: "45 min",
    status: "upcoming"
  },
  {
    id: 3,
    title: "Video Consultation",
    type: "consultation",
    date: "2025-01-18",
    time: "11:00 AM",
    duration: "60 min",
    status: "upcoming"
  }
];

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Schedule</h1>
            <p className="text-muted-foreground">
              Manage your sessions and appointments
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-border/50"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      {session.type === "assessment" && <Brain className="w-5 h-5 text-primary" />}
                      {session.type === "exercise" && <Brain className="w-5 h-5 text-primary" />}
                      {session.type === "consultation" && <Video className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.time}
                        </div>
                        <span>•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{session.status}</Badge>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
