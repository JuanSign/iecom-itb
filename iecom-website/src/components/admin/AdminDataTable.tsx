"use client";

import { useState, Fragment } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search, FileText, Download, Loader2, ExternalLink, Paperclip } from "lucide-react";
import { EditTeamDialog } from "./EditTeamDialog";
import { MemberManager } from "./MemberManager";
import { toast } from "sonner";
import { getSignedDocUrl } from "@/actions/server/admin";

export type AdminMember = {
  id: string; 
  name: string; 
  email: string; 
  role: string; 
  phone_num: string;
  institution: string | null; 
  id_no: string | null;       
  
  sc_verified: number; sc_link: string | null;
  fp_verified: number; fp_link: string | null;
  sd_verified: number; sd_link: string | null;
  sp_verified: number; sp_link: string | null;
  notes: string[] | null; status: number;
};

export type AdminTeam = {
  team_id: number; team_name: string; code: string;
  
  pp_verified?: number; 
  pp_link?: string | null;
  initial_draft_link?: string | null;
  final_report_link?: string | null;
  video_link?: string | null;
  infographic_link?: string | null;

  submission_status?: number; 
  bmc_link?: string | null; 
  poo_link?: string | null;
  
  members: AdminMember[]; notes: string[] | null; status: number;
};

// --- HELPERS ---

const hasSubmission = (team: AdminTeam, comp: "NICE" | "IECOM") => {
    if (comp === "IECOM") {
        return !!(team.initial_draft_link || team.final_report_link || team.video_link || team.infographic_link);
    }
    // For NICE
    return !!(team.bmc_link || team.poo_link);
};

const getPipelineBadge = (status: number, comp: 'NICE' | 'IECOM') => {
    if (status === 0) return <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">Waiting Members</Badge>;
    if (status === 2) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Accepted</Badge>;
    
    if (status === 1) {
        const label = comp === 'IECOM' ? "Waiting Payment" : "Waiting Submission";
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{label}</Badge>;
    }
    return <Badge variant="outline" className="bg-zinc-800 text-zinc-500">Unknown</Badge>;
};

const getPaymentBadge = (status: number) => {
    if (status === 2) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Paid</Badge>;
    if (status === 1) return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Check</Badge>;
};

const DocButton = ({ 
  label, 
  link, 
  loadingKey, 
  onClick,
  isExternal = false
}: { 
  label: string; 
  link?: string | null; 
  loadingKey?: string | null; 
  onClick?: (k: string) => void;
  isExternal?: boolean;
}) => {
  if (!link) return null;

  const handleClick = () => {
      if (isExternal) {
          window.open(link, "_blank");
      } else if (onClick) {
          onClick(link);
      }
  };

  return (
    <button 
      onClick={handleClick} 
      className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-blue-500/50 group transition-all w-full text-left"
    >
      <span className="text-xs text-zinc-300 flex items-center gap-2">
         {isExternal ? <ExternalLink className="h-3 w-3 text-zinc-500"/> : <Paperclip className="h-3 w-3 text-zinc-500"/>}
         {label}
      </span>
      
      {loadingKey === link ? (
        <Loader2 className="h-3 w-3 animate-spin text-zinc-500"/> 
      ) : (
        <Download className="h-3 w-3 text-zinc-500 group-hover:text-blue-400" />
      )}
    </button>
  );
};

export function AdminDataTable({ data, competition, role }: { data: AdminTeam[]; competition: "NICE" | "IECOM"; role: string }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  const toggleRow = (id: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedRows(newSet);
  };

  const openTeamDoc = async (key: string | null | undefined) => {
    if(!key) return;
    setLoadingDoc(key);
    const res = await getSignedDocUrl(key);
    setLoadingDoc(null);
    if(res.success && res.url) window.open(res.url, "_blank");
    else toast.error("Could not open document");
  }

  // 1. Filter
  const filteredData = data.filter(team => 
    team.team_name.toLowerCase().includes(search.toLowerCase()) ||
    team.code.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Sort (Submissions on top)
  const sortedData = [...filteredData].sort((a, b) => {
      const aHasSub = hasSubmission(a, competition);
      const bHasSub = hasSubmission(b, competition);
      
      // If a has sub and b doesn't, a comes first (-1)
      if (aHasSub && !bHasSub) return -1;
      // If b has sub and a doesn't, b comes first (1)
      if (!aHasSub && bHasSub) return 1;
      
      // Otherwise keep alphabetical
      return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search team name or code..." 
            className="pl-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="hover:bg-zinc-900 border-zinc-800">
              <TableHead className="w-[50px] text-zinc-500">#</TableHead>
              <TableHead className="text-zinc-300">Team Name</TableHead>
              <TableHead className="text-zinc-300">Code</TableHead>
              <TableHead className="text-zinc-300">{competition === 'IECOM' ? 'Payment' : 'Stage'}</TableHead>
              <TableHead className="text-zinc-300">Status</TableHead>
              <TableHead className="text-right text-zinc-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center text-zinc-500">No results found.</TableCell></TableRow>
            ) : (
              sortedData.map((team) => {
                const isSubmitted = hasSubmission(team, competition);
                
                return (
                <Fragment key={team.team_id}>
                  <TableRow className={`border-zinc-800 transition-colors ${expandedRows.has(team.team_id) ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'}`}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800 hover:text-white" onClick={() => toggleRow(team.team_id)}>
                        {expandedRows.has(team.team_id) ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                      </Button>
                    </TableCell>
                    
                    {/* HIGHLIGHTED TEAM NAME */}
                    <TableCell>
                        <div className={`font-medium flex items-center gap-2 ${isSubmitted ? 'text-emerald-400' : 'text-zinc-200'}`}>
                            {team.team_name}
                            {isSubmitted && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        </div>
                    </TableCell>

                    <TableCell className="font-mono text-zinc-500 text-xs">{team.code}</TableCell>
                    
                    <TableCell>
                      {competition === 'IECOM' ? (
                          getPaymentBadge(team.pp_verified ?? 0)
                      ) : (
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                             Stage {team.submission_status || 0}
                          </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                       {getPipelineBadge(team.status, competition)}
                    </TableCell>

                    <TableCell className="text-right">
                      {role === "ADMIN" && <EditTeamDialog team={team} competition={competition} />}
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(team.team_id) && (
                    <TableRow className="bg-black border-b border-zinc-800 hover:bg-black">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 border-l-2 border-emerald-600 bg-zinc-950/50 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2"><FileText className="h-3 w-3" /> Team Documents</h4>
                                        <div className="grid gap-2">
                                            {competition === 'IECOM' && (
                                                <>
                                                    {team.pp_link ? (
                                                        <DocButton label="Payment Proof" link={team.pp_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                    ) : (
                                                        <div className="text-xs text-zinc-600 italic p-2 border border-dashed border-zinc-800 rounded">No Payment Proof</div>
                                                    )}

                                                    {isSubmitted && <div className="my-2 border-t border-zinc-800"></div>}

                                                    <DocButton label="Initial Draft" link={team.initial_draft_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                    <DocButton label="Final Report" link={team.final_report_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                    
                                                    {/* EXTERNAL LINK FOR VIDEO */}
                                                    <DocButton label="Video" link={team.video_link} isExternal={true} />
                                                    
                                                    <DocButton label="Infographic" link={team.infographic_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                </>
                                            )}

                                            {competition === 'NICE' && (
                                                <>
                                                    <DocButton label="BMC" link={team.bmc_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                    <DocButton label="POO" link={team.poo_link} loadingKey={loadingDoc} onClick={openTeamDoc} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase text-zinc-500">Team Notes</h4>
                                        {team.notes && team.notes.length > 0 ? (
                                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {team.notes.map((note, i) => (
                                                    <div key={i} className="p-3 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">&quot;{note}&quot;</div>
                                                ))}
                                            </div>
                                        ) : <div className="p-4 border border-dashed border-zinc-800 rounded text-center"><p className="text-xs text-zinc-600">No notes.</p></div>}
                                    </div>
                                </div>
                                <div className="lg:col-span-8">
                                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4">Team Members ({team.members.length})</h4>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {team.members.map((m) => <MemberManager key={m.id} member={m} teamId={team.team_id} competition={competition} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )})
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}