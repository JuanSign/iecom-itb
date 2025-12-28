import { getTeamPageData } from "@/actions/server/competition/iecom";
import { TeamLeaveButton } from "@/components/TeamLeaveButton/TeamLeaveButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeamMemberDialog } from "@/components/TeamMemberDialog/TeamMemberDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Clock, Megaphone, Users, UserCheck, CalendarClock, MonitorPlay, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/MemberStatusBadge/MemberStatusBadge";
import { TeamStatusBadge } from "@/components/TeamStatusBadge/TeamStatusBadge";
import { PaymentSection } from "@/components/PaymentSection/PaymentSection";
import { DB } from "@/lib/DB";
import { TeamDescriptionManager } from "@/components/TeamDashboard/TeamDescriptionManager";
import { TeamRequestsList } from "@/components/TeamDashboard/TeamRequestsList";
import { AssessmentCountdown } from "@/components/AssessmentCountdown";

type TeamRequest = {
  id: string;
  name: string;
  institution: string;
  description: string;
  created_at: string;
};

function getInitials(name: string | null, email: string) {
  if (name) {
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : name.substring(0, 2);
  }
  return email.substring(0, 2);
}

function LockedSection({ 
  step, 
  title, 
  description, 
  subtext,
  borderColorClass 
}: { 
  step: string; 
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
            <Badge variant="outline" className="bg-transparent border-muted-foreground/50 text-muted-foreground">
                {step}
            </Badge>
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
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                    {subtext}
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}

function AssessmentSection({ startTimeISO }: { startTimeISO: string }) {
  return (
    <Card className="border-l-4 border-l-violet-500 shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-violet-500 hover:bg-violet-600">STEP 3</Badge>
              <span className="text-sm font-medium text-muted-foreground">Preliminary Round</span>
            </div>
            <CardTitle className="text-2xl">Multiple Choice Assessment</CardTitle>
            <CardDescription>
              Complete this assessment to qualify for the next stage.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">
             Upcoming
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-6">
        
        {/* Countdown Area */}
        <div className="bg-muted/30 border border-border/60 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
            <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Assessment Window Opens In
            </h4>
            <AssessmentCountdown targetDate={startTimeISO} />
            <p className="text-xs text-muted-foreground">
              {new Date(startTimeISO).toLocaleString('en-US', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' })} (GMT+7)
            </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert className="bg-blue-50/50 border-blue-100 text-blue-900">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-700 font-semibold mb-1">Mandatory Participation</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-blue-700/80">
                    Every team member is required to complete this assessment individually.
                </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50/50 border-amber-100 text-amber-900">
                <CalendarClock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 font-semibold mb-1">48-Hour Flexible Window</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-amber-700/80">
                    Your team may begin the assessment at any time within the 48-hour window starting from the opening time shown above.
                </AlertDescription>
            </Alert>

            <Alert className="bg-pink-50/50 border-pink-100 text-pink-900">
                <MonitorPlay className="h-4 w-4 text-pink-600" />
                <AlertTitle className="text-pink-700 font-semibold mb-1">Synchronized Timer</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-pink-700/80">
                    You have 60 minutes to complete the test. The timer starts <strong>globally for the entire team</strong> as soon as the first member begins.
                </AlertDescription>
            </Alert>

            <Alert className="bg-slate-50/50 border-slate-200 text-slate-900">
                <ShieldCheck className="h-4 w-4 text-slate-600" />
                <AlertTitle className="text-slate-700 font-semibold mb-1">Proctored Environment</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed text-slate-700/80">
                    The assessment takes place in a secure, monitored environment. Tab switching or leaving the window will be flagged as suspicious activity.
                </AlertDescription>
            </Alert>
        </div>

      </CardContent>
    </Card>
  );
}

const getTeamStatusText = (status: number) => {
  switch (status) {
    case 0: return "Waiting for Team Member Verification";
    case 1: return "Waiting for Payment";
    case 2: return "Accepted";
    default: return "Unknown Status";
  }
};

export default async function TeamPage() {
  const { team, members, currentUserAccountId } = await getTeamPageData();

  const teamStatus: number = team.status as number;
  const teamStatusText = getTeamStatusText(teamStatus);
  const isPaymentLocked = teamStatus == 0; 
  const isAccepted = teamStatus === 2;

  const ASSESSMENT_START_DATE = "2025-12-28T10:00:00+07:00"

  const requestsData = await DB`
    SELECT id, name, institution, description, created_at 
    FROM iecom_team_request 
    WHERE team_id = ${team.team_id}
    ORDER BY created_at DESC
  `;

  const requests = requestsData.map(req => ({
    ...req,
    created_at: new Date(req.created_at).toISOString()
  })) as TeamRequest[];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500 hover:bg-blue-600">STEP 1</Badge>
                        <span className="text-sm font-medium text-muted-foreground">Team Verification</span>
                    </div>
                    <CardTitle className="text-2xl">{team.name}</CardTitle>
                    <CardDescription>
                    Team Code: <span className="font-mono text-foreground font-bold">{team.code}</span>
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 text-xs font-medium text-secondary-foreground border rounded-md">
                      {teamStatusText}
                    </div>
                    <TeamStatusBadge 
                      statusText={getTeamStatusText(team.status)}
                      notes={team.notes} 
                    />
                </div>
            </div>
          </CardHeader>
          
          <Separator />

          <CardContent className="pt-6">
            <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <Users className="w-5 h-5 text-blue-500" /> Current Members
                </h4>
                <div className="flex flex-col gap-4">
                  {members.map((member) => (
                    <div key={member.account_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.sc_link || ""} alt={member.name || "Member"} />
                          <AvatarFallback>
                            {getInitials(member.name, member.email).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.name || member.email}
                            {member.account_id === currentUserAccountId && (
                              <span className="text-xs text-muted-foreground ml-2">(You)</span>
                            )}
                          </p>
                          {member.name && (
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TeamMemberDialog 
                          member={member}
                          isCurrentUser={member.account_id === currentUserAccountId}
                          event="IECOM"
                        />
                        <MemberStatusBadge 
                          status={member.status} 
                          notes={member.notes} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-orange-500" /> Recruitment & Profile
                    </h4>
                    
                    <TeamDescriptionManager 
                        teamId={team.team_id} 
                        messages={team.messages || []} 
                        type="iecom"
                    />
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-sm text-foreground">Pending Join Requests</h5>
                        <Badge variant="secondary" className="px-2">{requests.length}</Badge>
                    </div>
                    
                    <TeamRequestsList 
                        requests={requests} 
                        teamId={team.team_id} 
                        type="iecom" 
                    />
                </div>
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="pt-6 bg-muted/5">
            <TeamLeaveButton event="IECOM"/>
          </CardFooter>
        </Card>

        {isPaymentLocked ? (
            <LockedSection 
              step="STEP 2"
              title="Payment"
              description="Upload your proof of payment for the registration fee."
              subtext={"This step will unlock after all member details are accepted."}
              borderColorClass="border-l-emerald-500"
            />
        ) : (
            <PaymentSection 
              paymentProofUrl={team.pp_link}
              ppVerified={team.pp_verified}
              step="STEP 2"
              className="border-l-emerald-500"
            />
        )}

        {isAccepted ? (
           <AssessmentSection startTimeISO={ASSESSMENT_START_DATE} />
        ) : (
           <LockedSection 
             step="STEP 3"
             title="Multiple Choice Assessment"
             description="Qualifying round for all team members."
             subtext="This section will unlock once your team is officially Accepted (Status 2)."
             borderColorClass="border-l-violet-500"
           />
        )}
      </div>
    </div>
  );
}