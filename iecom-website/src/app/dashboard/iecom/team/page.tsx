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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MemberStatusBadge } from "@/components/MemberStatusBadge/MemberStatusBadge";
import { TeamStatusBadge } from "@/components/TeamStatusBadge/TeamStatusBadge";
import { PaymentSection } from "@/components/PaymentSection/PaymentSection";

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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        <Card className="border-l-4 border-l-blue-500">
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
                      status={teamStatus} 
                      notes={team.notes} 
                    />
                </div>
            </div>
          </CardHeader>
          
          <Separator />

          <CardContent className="pt-6">
            <h4 className="text-lg font-semibold mb-4">
              Members ({members.length})
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
          </CardContent>

          <Separator />

          <CardFooter className="pt-6">
            <TeamLeaveButton event="IECOM"/>
          </CardFooter>
        </Card>

        {isPaymentLocked ? (
            <LockedSection 
              step="STEP 2"
              title="Payment"
              description="Upload your proof of payment for the registration fee."
              subtext={isPaymentLocked 
                  ? "This step will unlock after all member details are accepted." 
                  : "This step will unlock after your Core Documents (SP & OL) are accepted."
              }
              borderColorClass="border-l-emerald-500"
            />
        ) : (
            <PaymentSection 
              paymentProofUrl={team.pp_link}
              ppVerified={team.pp_verified}
              step="STEP 3"
              className="border-l-emerald-500"
            />
        )}
      </div>
    </div>
  );
}