"use client";

import { TeamData, CompetitionType } from "@/actions/types/Admin";
import { DocButton } from "./DocButton";
import { MemberManager } from "./MemberManager";
import { FileText, Send, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateTeamStatus } from "@/actions/server/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TeamDetails({ team, competition }: { team: TeamData; competition: CompetitionType }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setLoading(true);
    const res = await updateTeamStatus(competition, team.teamId, "general_note", note, "add_note");
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Note added");
      setNote("");
    }
  };

  const handleDeleteNote = async (noteText: string) => {
     const res = await updateTeamStatus(competition, team.teamId, "notes", noteText, "remove_note");
     if (res?.error) toast.error("Failed to remove note");
     else toast.success("Note removed");
  };

  return (
    <div className="p-6 border-l-2 border-emerald-600 bg-zinc-950/50 shadow-inner">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Documents & Notes */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
            <FileText className="h-3 w-3" /> Team Documents
          </h4>
          <div className="grid gap-2">
            {competition === "IECOM" ? (
              <>
                <DocButton label="Payment Proof" link={team.paymentProofLink} />
                <DocButton label="Initial Draft" link={team.initialDraftLink} />
                <DocButton label="Final Report" link={team.finalReportLink} />
                <DocButton label="Infographic" link={team.infographicLink} />
                <DocButton label="Video" link={team.videoLink} isExternal />
              </>
            ) : (
              <>
                {/* Stage 1 & 2 */}
                <DocButton label="BMC" link={team.bmcLink} />
                <DocButton label="POO" link={team.pooLink} />
                <DocButton label="Payment Proof" link={team.paymentProofLink} />
                <DocButton label="Proposal" link={team.proposalLink} />
                
                {/* Stage 3 - Final */}
                <div className="pt-2 mt-2 border-t border-zinc-800">
                    <p className="text-[10px] text-zinc-500 mb-2 font-mono uppercase">Stage 3 Deliverables</p>
                    <div className="grid gap-2">
                        <DocButton 
                            label="Commitment Letter" 
                            link={team.commitmentLink} 
                            date={team.commitmentAt} 
                        />
                        <DocButton 
                            label="Exhibition Banner" 
                            link={team.bannerLink} 
                            date={team.bannerAt} 
                        />
                        <DocButton 
                            label="Pitch Deck (PPT)" 
                            link={team.pptLink} 
                            date={team.pptAt} 
                        />
                    </div>
                </div>
              </>
            )}
          </div>
        </div>

          <div className="space-y-3">
             <h4 className="text-xs font-bold uppercase text-zinc-500">Team Notes</h4>
             {team.notes && team.notes.length > 0 && (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto border border-zinc-800 rounded p-2 bg-zinc-950/50">
                  {team.notes.map((n, i) => (
                    <div key={i} className="flex justify-between items-start gap-2 text-xs text-zinc-400 bg-zinc-900 p-2 rounded group">
                       <span>{n}</span>
                       <button onClick={() => handleDeleteNote(n)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
             )}
             <form onSubmit={handleAddNote} className="flex gap-2">
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Add note..." className="bg-zinc-950 border-zinc-700 text-sm" />
                <Button type="submit" size="icon" className="bg-zinc-800 hover:bg-zinc-700 shrink-0" disabled={loading}>
                   {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
             </form>
          </div>
        </div>

        {/* Right Column: Members */}
        <div className="lg:col-span-8">
          <h4 className="text-xs font-bold uppercase text-zinc-500 mb-4">Team Members ({team.members.length})</h4>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             {team.members.map(m => (
               <MemberManager key={m.id} member={m} teamId={team.teamId} competition={competition} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}