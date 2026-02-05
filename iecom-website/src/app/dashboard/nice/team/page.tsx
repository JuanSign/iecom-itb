import { getTeamPageData } from "@/actions/server/competition/nice";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock, Megaphone, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/MemberStatusBadge/MemberStatusBadge";
import { TeamStatusBadge } from "@/components/TeamStatusBadge/TeamStatusBadge";
import { DocumentsSection } from "@/components/DocumentSection/DocumentSection";
import { DB } from "@/lib/DB";
import { TeamDescriptionManager } from "@/components/TeamDashboard/TeamDescriptionManager";
import { TeamRequestsList } from "@/components/TeamDashboard/TeamRequestsList";
import { StageTwoSection } from "@/components/StageTwo";
import { getSignedUrlForR2 } from "@/lib/R2";
import { StageThreeSection } from "@/components/StageThree";

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

const getTeamStatusText = (status: number) => {
  switch (status) {
    case 0: return "Waiting for Team Member Verification";
    case 1: return "Documents Submission Open";
    case 2: return "Accepted";
    default: return "Unknown Status";
  }
};

export default async function TeamPage() {
  const { team, members, currentUserAccountId } = await getTeamPageData();

  const teamStatus: number = team.status as number;
  const teamStatusText = getTeamStatusText(teamStatus);
  const isDocsLocked = teamStatus === 0; 

  const requestsData = await DB`
    SELECT id, name, institution, description, created_at 
    FROM nice_team_request 
    WHERE team_id = ${team.team_id}
    ORDER BY created_at DESC
  `;

  const [
    paymentProofUrl, 
    proposalUrl,
    commitmentUrl,
    bannerUrl,
    pptUrl
  ] = await Promise.all([
    getSignedUrlForR2(team.paymentProofLink),
    getSignedUrlForR2(team.proposalLink),
    getSignedUrlForR2(team.commitmentLink),
    getSignedUrlForR2(team.bannerLink),
    getSignedUrlForR2(team.pptLink),
  ]);

  const requests = requestsData.map(req => ({
    ...req,
    created_at: new Date(req.created_at).toISOString()
  })) as TeamRequest[];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Main Team Card */}
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
                          <AvatarImage src={member.fp_link || ""} alt={member.name || "Member"} />
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
                          event="NICE"
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
                        type="nice"
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
                        type="nice"
                    />
                </div>
            </div>

          </CardContent>

          <Separator />

          <CardFooter className="pt-6 bg-muted/5">
            <TeamLeaveButton event="NICE"/>
          </CardFooter>
        </Card>

        {isDocsLocked ? (
            <LockedSection 
              step="STEP 2"
              title="Documents"
              description="Upload your Business Model Canvas and Proof of Originality."
              subtext="This step will unlock after all member details are accepted."
              borderColorClass="border-l-emerald-500"
            />
        ) : (
            <DocumentsSection
              step="STEP 2"
              bmcLink={team.bmc_link}
              pooLink={team.poo_link}
              submissionStatus={team.submission_status} 
              className="border-l-emerald-500"
            />
        )}

        <StageTwoSection 
          teamId={team.team_id}
          paymentProofLink={team.paymentProofLink}
          proposalLink={team.proposalLink}
          viewPaymentUrl={paymentProofUrl}
          viewProposalUrl={proposalUrl}
        />

        {team.submission_status === 3 && (
            <StageThreeSection 
                teamId={team.team_id}
                commitmentLink={team.commitmentLink}
                commitmentAt={team.commitmentAt}
                bannerLink={team.bannerLink}
                bannerAt={team.bannerAt}
                pptLink={team.pptLink}
                pptAt={team.pptAt}
                viewCommitmentUrl={commitmentUrl}
                viewBannerUrl={bannerUrl}
                viewPptUrl={pptUrl}
            />
        )}
      </div>
    </div>
  );
}