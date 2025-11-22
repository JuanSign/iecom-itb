"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { EditTeamDialog } from "./EditTeamDialog";

// --- TYPES ---

export type AdminMember = {
  id: number;
  name: string;
  email: string;
  phone_num: string;
  sc_verified: number;
  sc_link: string | null;
  fp_verified: number;
  fp_link: string | null;
};

export type AdminTeam = {
  team_id: number;
  team_name: string;
  code: string;
  pp_verified: number;
  pp_link: string | null;
  submission_status: number;
  bmc_link: string | null;
  poo_link: string | null;
  members: AdminMember[];
  notes: string[] | null;
};

// --- HELPER ---

const getStatusBadge = (status: number, type: 'payment' | 'general') => {
  const styles: Record<number, string> = {
    0: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    1: "bg-red-500/10 text-red-500 border-red-500/20",
    2: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    3: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  const className = styles[status] || "bg-zinc-800 text-zinc-400";

  let label = "Unknown";
  if (type === 'payment') {
    label = status === 0 ? "Pending" : status === 1 ? "Rejected" : "Verified";
  } else {
    label = `Stage ${status}`;
    if (status === 0) label = "Registered";
  }

  return <Badge variant="outline" className={className}>{label}</Badge>;
};

// --- COMPONENT ---

export function AdminDataTable({ 
  data, 
  competition, 
  role 
}: { 
  data: AdminTeam[]; 
  competition: "NICE" | "IECOM"; 
  role: string 
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const toggleRow = (id: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const filteredData = data.filter(team => 
    team.team_name.toLowerCase().includes(search.toLowerCase()) ||
    team.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search team name or code..." 
            className="pl-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="hover:bg-zinc-900 border-zinc-800">
              <TableHead className="w-[50px] text-zinc-500">#</TableHead>
              <TableHead className="text-zinc-300">Team Name</TableHead>
              <TableHead className="text-zinc-300">Code</TableHead>
              <TableHead className="text-zinc-300">Payment</TableHead>
              <TableHead className="text-zinc-300">Stage</TableHead>
              <TableHead className="text-right text-zinc-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-24 text-center text-zinc-500">No results found.</TableCell>
               </TableRow>
            ) : (
              filteredData.map((team) => (
                <Fragment key={team.team_id}>
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleRow(team.team_id)}>
                        {expandedRows.has(team.team_id) ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-200">{team.team_name}</TableCell>
                    <TableCell className="font-mono text-zinc-500 text-xs">{team.code}</TableCell>
                    <TableCell>
                      {getStatusBadge(team.pp_verified, 'payment')}
                    </TableCell>
                    <TableCell>
                       {getStatusBadge(team.submission_status || 0, 'general')}
                    </TableCell>
                    <TableCell className="text-right">
                      {role === "ADMIN" && (
                        <EditTeamDialog team={team} competition={competition} />
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* EXPANDED DETAILS */}
                  {expandedRows.has(team.team_id) && (
                    <TableRow className="bg-zinc-950 border-b border-zinc-800 hover:bg-zinc-950">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-4 bg-zinc-900/30 border-l-2 border-emerald-500 ml-4 my-2 mr-4 rounded-r">
                            
                            {/* DOCUMENTS */}
                            <div className="mb-4 pb-4 border-b border-zinc-800/50">
                                <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Team Documents</h4>
                                <div className="flex flex-wrap gap-3">
                                    {team.pp_link ? (
                                        <a href={team.pp_link} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded">Payment Proof ↗</a>
                                    ) : <span className="text-xs text-zinc-600 italic">No Payment Proof</span>}
                                    
                                    {team.bmc_link && (
                                         <a href={team.bmc_link} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded">BMC ↗</a>
                                    )}
                                    {team.poo_link && (
                                         <a href={team.poo_link} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded">POO ↗</a>
                                    )}
                                </div>
                            </div>

                            {/* MEMBERS */}
                            <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Members ({team.members.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {team.members && team.members.map((m) => (
                                    <div key={m.id} className="p-3 border border-zinc-800 rounded bg-zinc-900/80">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-zinc-200">{m.name}</p>
                                                <p className="text-xs text-zinc-500">{m.email}</p>
                                                <p className="text-xs text-zinc-500">{m.phone_num}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-2 flex-wrap">
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400">SC: {m.sc_verified}</Badge>
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400">FP: {m.fp_verified}</Badge>
                                            {m.sc_link && <a href={m.sc_link} target="_blank" className="text-[10px] text-blue-500 underline ml-auto">View SC</a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}