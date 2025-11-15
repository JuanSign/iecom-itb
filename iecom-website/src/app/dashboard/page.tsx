import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/actions/server/session";
import { cn } from "@/lib/utils";
import { CompetitionEntryDialog } from "@/components/CompetitionEntryDialog/CompetitionEntryDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Lightbulb,
  Briefcase,
  Lock,
  AlertCircle
} from "lucide-react";
import { Toaster } from "sonner";

function LockedSection({ 
  title, 
  description, 
  subtext,
  borderColorClass 
}: { 
  title: string; 
  description: string; 
  subtext?: string;
  borderColorClass: string; 
}) {
  return (
    <Card className={cn(
        "bg-muted/40 border-dashed border-muted-foreground/25 opacity-80 border-l-4",
        borderColorClass 
    )}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" /> Locked
            </Badge>
        </div>
        <CardTitle className="text-xl text-muted-foreground/90">
            {title}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/70">
          {description}
        </CardDescription>
      </CardHeader>
      {subtext && (
        <CardContent>
            <Alert variant="default" className="bg-background/50 text-muted-foreground border-muted-foreground/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    {subtext}
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}

// --- Main Page Component ---
export default async function CompetitionPage() {
  const session = await verifySession();
  if (!session) redirect("/register");

  const hasJoinedIECOM = session.events?.includes("IECOM") ?? false;
  const hasJoinedNICE = session.events?.includes("NICE") ?? false;

  const isIECOMLocked = hasJoinedNICE; 
  const isNICELocked = hasJoinedIECOM; 

  const lockMessage = "You must choose one competition to join: IECOM or NICE.";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Toaster richColors/>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* --- 1. IECOM (Industrial Engineering Competition) --- */}
        {isIECOMLocked ? (
            <LockedSection 
              title="IECOM (Industrial Engineering Competition)"
              description="International competition where students tackle real industrial challenges."
              subtext={`${lockMessage} You have already joined NICE.`}
              borderColorClass="border-l-primary"
            />
        ) : (
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>IECOM</CardTitle>
                  <CardDescription>Industrial Engineering Competition</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                International competition where students tackle real industrial challenges 
                through case studies, simulations, and data-driven analysis.
              </p>
              <p className="text-sm font-medium mt-2">Open to teams of 3 participants.</p>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end">
              <Button variant="outline" asChild>
              <Link 
                href="https://bit.ly/GuidebookIECOM2026" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Show More
              </Link>
              </Button>
              {/* --- Use the new component --- */}
              <CompetitionEntryDialog 
                competition="IECOM"
                competitionFullName="Industrial Engineering Competition"
                hasJoined={hasJoinedIECOM}
              />
            </CardFooter>
          </Card>
        )}

        {/* --- 2. NICE (National Industrial Competition for Entrepreneurs) --- */}
        {isNICELocked ? (
            <LockedSection 
              title="NICE (National Industrial Competition for Entrepreneurs)"
              description="National platform that challenges students to develop and pitch innovative business plans."
              subtext={`${lockMessage} You have already joined IECOM.`}
              borderColorClass="border-l-yellow-600"
            />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>NICE</CardTitle>
                  <CardDescription>
                    National Industrial Competition for Entrepreneurs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                    National platform that challenges students to develop and pitch 
                    innovative business plans.
                </p>
                <p className="text-sm font-medium mt-2">Open to teams of 1-3 participants.</p>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end">
              <Button variant="outline" asChild>
                <Link 
                  href="https://bit.ly/GuidebookNICE2026" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Show More
                </Link>
              </Button>
              {/* --- Use the new component --- */}
              <CompetitionEntryDialog 
                competition="NICE"
                competitionFullName="National Industrial Competition for Entrepreneurs"
                hasJoined={hasJoinedNICE}
              />
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}