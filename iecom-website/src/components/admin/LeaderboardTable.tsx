"use client";

import { useState, Fragment } from "react"; // <--- Import Fragment
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Search, Trophy, Medal } from "lucide-react";
import { LeaderboardTeam } from "@/actions/types/Admin";

export function LeaderboardTable({ data }: { data: LeaderboardTeam[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedRows(newSet);
  };

  const filteredData = data.filter(team =>
    team.teamName.toLowerCase().includes(search.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-zinc-300 fill-zinc-300/20" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-700 fill-amber-700/20" />;
    return <span className="text-zinc-500 font-mono w-4 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search team name..." 
            className="pl-8 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-zinc-500 text-xs font-mono">
            Total Teams: {filteredData.length}
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden bg-zinc-950">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="hover:bg-zinc-900 border-zinc-800">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-zinc-300 w-[100px]">Rank</TableHead>
              <TableHead className="text-zinc-300">Team Name</TableHead>
              <TableHead className="text-zinc-300 text-right">Total Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center text-zinc-500">No results found.</TableCell></TableRow>
            ) : (
                filteredData.map((team) => (
                 /* 👇 CHANGE IS HERE: Use Fragment with key, NOT <> */
                 <Fragment key={team.teamId}>
                   <TableRow 
                     className={`border-zinc-800 transition-colors ${expandedRows.has(team.teamId) ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'}`}
                   >
                     <TableCell>
                       <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800 hover:text-white" onClick={() => toggleRow(team.teamId)}>
                         {expandedRows.has(team.teamId) ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                       </Button>
                     </TableCell>
                     
                     <TableCell>
                        <div className="flex items-center gap-2 font-bold text-zinc-300">
                            {getRankIcon(team.rank)}
                        </div>
                     </TableCell>

                     <TableCell>
                       <div className="font-medium text-zinc-200">{team.teamName}</div>
                     </TableCell>

                     <TableCell className="text-right">
                        <span className="font-mono text-emerald-400 font-bold">{team.totalScore.toFixed(2)}</span>
                     </TableCell>
                   </TableRow>
                   
                   {expandedRows.has(team.teamId) && (
                     <TableRow className="bg-black border-b border-zinc-800 hover:bg-black">
                       <TableCell colSpan={4} className="p-0">
                          <div className="p-4 bg-zinc-950/50 border-l-2 border-emerald-600 shadow-inner">
                            <h4 className="text-xs font-bold uppercase text-zinc-500 mb-3">Member Contribution</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {team.members.map((member, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 rounded bg-zinc-900 border border-zinc-800">
                                        <span className="text-xs text-zinc-300">{member.name}</span>
                                        <Badge variant="outline" className={`font-mono text-xs ${member.score >= 0 ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}>
                                            {member.score > 0 ? '+' : ''}{member.score.toFixed(2)}
                                        </Badge>
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