import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Clock, Star, ArrowRight } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Event Schedule</h2>
          <p className="text-muted-foreground">
            Timeline of activities for IECOM 2026
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* --- PRE-EVENT --- */}
        <Card className="lg:col-span-3 border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                Pre-Event
              </Badge>
            </div>
            <CardTitle className="text-2xl">CarIEr Path: Job Fair</CardTitle>
            <CardDescription className="text-base mt-2">
              CarIEr Path, the Pre-Event of IECOM 2026, is the opening phase leading up to IECOM 2026. 
              It is designed to connect students with companies and introduce the event’s main themes. 
              It provides networking opportunities, career seminars, and sessions where companies can showcase 
              their roles in the industry.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            {/* Logistics */}
            <div className="space-y-4 md:col-span-1">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Friday, December 12, 2025</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">09.00 - 17.30</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="font-medium">Aula Timur Institut Teknologi Bandung (ITB)</span>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Key Activities
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ActivityItem 
                  title="Job Fair" 
                  desc="Interaction with reputable organizations, company profiles, and career opportunities." 
                />
                <ActivityItem 
                  title="Scholarship Booths" 
                  desc="Information on international scholarships, requirements, and application tips." 
                />
                <ActivityItem 
                  title="Talk Show" 
                  desc="“Building Your Career Path: From Campus to Corporate” - Insights on career readiness." 
                />
                <ActivityItem 
                  title="Seminar" 
                  desc="“How to Make a Good CV” - Advice from HR practitioners on creating competitive CVs." 
                />
                <ActivityItem 
                  title="CV Review Booths" 
                  desc="Personalized feedback and recommendations on CVs from experienced professionals." 
                />
                <ActivityItem 
                  title="Creative Video Competition" 
                  desc="A platform to express ideas and creativity. Guidelines to be announced." 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- GRAND SUMMIT --- */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2 border-emerald-500 text-emerald-600">
              Main Event
            </Badge>
            <CardTitle className="text-xl">Grand Summit</CardTitle>
            <CardDescription>
              The pinnacle of IECOM 2026. A central component where thought leaders and industry professionals 
              share insights on trends and innovations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Saturday, Feb 14, 2026</span> 
                  {/* Corrected year to 2026 based on context, adjust if needed */}
               </div>
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time: TBA</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                  <MapPin className="h-4 w-4" />
                  <span>Venue: TBA</span>
               </div>
            </div>
            
            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Highlights</h4>
              <ul className="space-y-3">
                <ListItem title="Talkshow on Sustainable Innovation">
                  Featuring distinguished speakers and influential public figures.
                </ListItem>
                <ListItem title="NICE Booths">
                  Showcase of student-driven innovation from Business Plan Competition (BPC) finalists.
                </ListItem>
                <ListItem title="Special Performance">
                  Entertainment to enliven the event.
                </ListItem>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* --- GALA NIGHT --- */}
        <Card className="lg:col-span-1 flex flex-col bg-slate-50 dark:bg-slate-900/50">
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2 border-purple-500 text-purple-600">
              Closing Event
            </Badge>
            <CardTitle className="text-xl">Gala Night</CardTitle>
            <CardDescription>
              The grand closing event celebrating the winners and finalists.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-6">
             <div className="space-y-2 text-sm">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Sunday, Feb 15, 2026</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Venue: TBA</span>
               </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Agenda</h4>
              <ul className="space-y-3">
                <ListItem title="Awarding Night">
                  Celebration of winners for their creativity and innovation.
                </ListItem>
                <ListItem title="Gala Dinner">
                  A curated meal and networking evening.
                </ListItem>
                <ListItem title="Performance">
                  Special closing performance.
                </ListItem>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components for clean code
function ActivityItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md border p-3 shadow-sm bg-card">
      <div className="font-medium text-sm mb-1 text-blue-700">{title}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">
        {desc}
      </div>
    </div>
  );
}

function ListItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm">
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <span>
        <span className="font-medium block text-foreground">{title}</span>
        <span className="text-muted-foreground text-xs">{children}</span>
      </span>
    </li>
  );
}