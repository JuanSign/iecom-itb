import { DB } from '@/lib/DB';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  School, 
  MessageSquare, 
  Quote, 
  Users,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { TeamRequestDialog } from '@/components/TeamRequestDialog';
import { Toaster } from 'sonner';

// --- Types ---
type Team = {
  team_id: string;
  name: string;
  count: number;
  messages: string[];
};

type Member = {
  account_id: string;
  team_id: string;
  name: string | null;
  institution: string | null;
};

type TeamWithMembers = Team & { members: Member[] };

const ITEMS_PER_PAGE = 10;

export default async function SearchTeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ options: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { options } = await params;
  const resolvedSearchParams = await searchParams;
  
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const competitionType = options === 'nice' ? 'nice' : 'iecom';

  let teamsData: Team[] = [];
  if (competitionType === 'nice') {
    teamsData = await DB`
      SELECT team_id, name, count, messages 
      FROM nice_team 
      WHERE count < 3
      ORDER BY team_id ASC 
      LIMIT ${ITEMS_PER_PAGE} 
      OFFSET ${offset}
    ` as Team[];
  } else {
    teamsData = await DB`
      SELECT team_id, name, count, messages 
      FROM iecom_team 
      WHERE count < 3
      ORDER BY team_id ASC 
      LIMIT ${ITEMS_PER_PAGE} 
      OFFSET ${offset}
    ` as Team[];
  }

  let membersData: Member[] = [];
  if (teamsData.length > 0) {
    const teamIds = teamsData.map((t) => t.team_id);
    
    if (teamIds.length > 0) {
      if (competitionType === 'nice') {
        membersData = await DB`
          SELECT account_id, team_id, name, institution 
          FROM nice_member 
          WHERE team_id = ANY(${teamIds})
        ` as Member[];
      } else {
        membersData = await DB`
          SELECT account_id, team_id, name, institution 
          FROM iecom_member 
          WHERE team_id = ANY(${teamIds})
        ` as Member[];
      }
    }
  }

  const teams: TeamWithMembers[] = teamsData.map((team) => ({
    ...team,
    members: membersData.filter((m) => m.team_id === team.team_id),
  }));

  const hasNextPage = teamsData.length === ITEMS_PER_PAGE;

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-background to-background/80 relative overflow-hidden">
      <Toaster/>  
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto py-12 px-4 md:px-8 max-w-5xl relative z-10">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2 uppercase">
            <Search className="w-3 h-3" />
            <span>{competitionType} Team Finder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-indigo-400">
            Find Your Squad
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Browse through registered <strong>{competitionType.toUpperCase()}</strong> teams, explore their profiles, and find the perfect group to join for the competition.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-0">
            {teams.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="bg-muted/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No teams found</h3>
                <p className="text-muted-foreground mt-2">Try checking back later for new registrations.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {teams.map((team, index) => (
                  <AccordionItem 
                    key={team.team_id} 
                    value={`item-${team.team_id}`}
                    className={`border-b border-white/5 px-6 transition-all duration-300 data-[state=open]:bg-white/3 ${index === teams.length - 1 ? 'border-none' : ''}`}
                  >
                    <AccordionTrigger className="hover:no-underline py-6 group">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center gap-4">
                          {/* Team Avatar Placeholder */}
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            {team.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <span className="font-semibold text-lg text-foreground group-hover:text-indigo-400 transition-colors">
                              {team.name}
                            </span>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={`ml-2 whitespace-nowrap border-0 px-3 py-1 ${
                          team.count >= 3 
                            ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                        }`}>
                          <Users className="w-3 h-3 mr-1.5" />
                          {team.count} / 3 Members
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pb-8 pt-2">
                      <div className="space-y-8 pl-13">
                        
                        {/* Section: Messages */}
                        {team.messages && team.messages.length > 0 && (
                          <div className="relative">
                            <div className="absolute -left-5 top-0 bottom-0 w-0.5 bg-linear-to-b from-indigo-500/50 to-transparent"></div>
                            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-medium text-sm uppercase tracking-wider">
                              <MessageSquare className="w-4 h-4" />
                              <span>Team Description</span>
                            </div>
                            <div className="grid gap-3">
                              {team.messages.map((msg, idx) => (
                                <div key={idx} className="relative bg-white/5 border border-white/10 p-4 rounded-r-xl rounded-bl-xl text-sm leading-relaxed text-gray-300">
                                  <Quote className="absolute top-3 left-3 w-4 h-4 text-white/10 rotate-180" />
                                  <p className="pl-6 italic">{msg}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section: Members */}
                        <div>
                          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-medium text-sm uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            <span>Current Roster</span>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-2">
                            {team.members.length > 0 ? (
                              team.members.map((member) => (
                                <div
                                  key={member.account_id}
                                  className="group relative overflow-hidden bg-black/20 border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 rounded-lg bg-white/5 text-indigo-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                                      <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className={`font-medium text-sm ${!member.name ? 'text-muted-foreground italic' : 'text-gray-200'}`}>
                                        {member.name || "No name added"}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <School className="w-3 h-3 text-indigo-400/70" />
                                        <span className={`truncate ${!member.institution ? 'italic opacity-50' : ''}`}>
                                          {member.institution || "Institution not specified"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full py-4 text-center border border-dashed border-white/10 rounded-xl">
                                <p className="text-sm text-muted-foreground">No members listed yet.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Action Button: Dialog Component */}
                        <div className="flex justify-end">
                          <TeamRequestDialog 
                            teamId={team.team_id}
                            teamName={team.name}
                            type={competitionType} 
                          />
                        </div>

                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* Pagination Controls */}
            <div className="bg-black/20 border-t border-white/5 p-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                className="border-white/10 hover:bg-white/5 hover:text-indigo-400"
                asChild
              >
                <Link
                  href={{
                    pathname: `/dashboard/find-team/${competitionType}`,
                    query: { page: currentPage - 1 },
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Link>
              </Button>
              
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Page {currentPage}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                className="border-white/10 hover:bg-white/5 hover:text-indigo-400"
                asChild
              >
                <Link
                  href={{
                    pathname: `/dashboard/find-team/${competitionType}`,
                    query: { page: currentPage + 1 },
                  }}
                  className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}