"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { TeamData, CompetitionType, VerificationStatus } from "@/actions/types/Admin";
import { EditTeamDialog } from "./EditTeamDialog";
import { TeamDetails } from "./TeamDetails";
import { StatusBadge } from "./StatusBadge";

export function AdminDataTable({ data, competition, role }: { data: TeamData[]; competition: CompetitionType; role: string }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedRows(newSet);
  };

  const filteredData = data.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search team name or code..."
          className="pl-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
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
            {filteredData.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center text-zinc-500">No results found.</TableCell></TableRow>
            ) : (
               filteredData.map((team) => (
                 <TeamRow 
                   key={team.teamId} 
                   team={team} 
                   competition={competition} 
                   role={role}
                   isExpanded={expandedRows.has(team.teamId)}
                   onToggle={() => toggleRow(team.teamId)}
                 />
               ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Sub-component for performance and cleanliness
interface TeamRowProps {
  team: TeamData;
  competition: CompetitionType;
  role: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function TeamRow({ team, competition, role, isExpanded, onToggle }: TeamRowProps) {
  // Determine displayed Payment/Stage status based on competition
  let verificationStatus: number | VerificationStatus = 0;
  
  if (competition === "IECOM") {
    verificationStatus = team.ppVerified ?? 0;
  } else {
    // For NICE, use submissionStatus
    verificationStatus = team.submissionStatus ?? 0;
  }

  return (
    <>
      <TableRow className={`border-zinc-800 transition-colors ${isExpanded ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'}`}>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800 hover:text-white" onClick={onToggle}>
            {isExpanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
          </Button>
        </TableCell>
        
        <TableCell>
          <div className="font-medium text-zinc-200">{team.name}</div>
        </TableCell>

        <TableCell className="font-mono text-zinc-500 text-xs">{team.code}</TableCell>
        
        <TableCell>
           <StatusBadge 
             status={verificationStatus} 
             type={competition === "IECOM" ? "verification" : "pipeline"} 
             label={competition === "NICE" ? `Stage ${verificationStatus}` : undefined}
           />
        </TableCell>

        <TableCell>
           <StatusBadge status={team.status} type="pipeline" label={competition === "IECOM" ? "Payment" : "Submission"} />
        </TableCell>

        <TableCell className="text-right">
          {role === "ADMIN" && <EditTeamDialog team={team} competition={competition} />}
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow className="bg-black border-b border-zinc-800 hover:bg-black">
          <TableCell colSpan={6} className="p-0">
             <TeamDetails team={team} competition={competition} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}