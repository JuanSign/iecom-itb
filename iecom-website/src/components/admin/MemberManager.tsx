"use client";

import { useState } from "react";
import { updateMemberStatus, getSignedDocUrl } from "@/actions/server/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, ExternalLink, Loader2, User, Trash2, Mail, Phone, Building, Hash } from "lucide-react";
import { toast } from "sonner";
import { TeamMember, CompetitionType, VERIFICATION_STATUS } from "@/actions/types/Admin";

interface MemberManagerProps {
  member: TeamMember;
  teamId: string;
  competition: CompetitionType;
}

export function MemberManager({ member, teamId, competition }: MemberManagerProps) {
  const [note, setNote] = useState("");
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

  const handleUpdate = async (field: string, value: number, noteContent?: string) => {
    setLoadingField(field);

    const res = await updateMemberStatus(competition, teamId, member.id, field, value);
    
    // If there is a rejection note, send it as a separate update
    if (res.success && noteContent) {
      await updateMemberStatus(competition, teamId, member.id, "general_note", noteContent, "add_note");
      setNote("");
    }

    if (res?.error) toast.error(res.error);
    else toast.success("Updated member status");
    
    setLoadingField(null);
  };

  const handleDeleteNote = async (noteText: string) => {
    const res = await updateMemberStatus(competition, teamId, member.id, "notes", noteText, "remove_note");
    if (res?.error) toast.error("Failed to delete note");
    else toast.success("Note deleted");
  };

  const handleOpenDoc = async (key: string | null, docName: string) => {
    if (!key) return;
    setOpeningDoc(docName);
    const res = await getSignedDocUrl(key);
    if (res?.success && res.url) window.open(res.url, "_blank");
    else toast.error("Failed to load document");
    setOpeningDoc(null);
  };

  const renderDocRow = (label: string, linkKey: string | null, status: number, field: string) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-zinc-400 w-20 truncate" title={label}>{label}</span>
        {linkKey ? (
          <Button
            onClick={() => handleOpenDoc(linkKey, field)}
            variant="ghost"
            disabled={openingDoc === field}
            className="flex items-center gap-1 h-6 px-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded transition-colors"
          >
            {openingDoc === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="flex items-center gap-1">OPEN <ExternalLink className="h-3 w-3" /></span>}
          </Button>
        ) : (
          <span className="text-[10px] text-zinc-600 italic">Missing</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {status === VERIFICATION_STATUS.VERIFIED && <Badge className="text-[9px] px-1 h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</Badge>}
        {status === VERIFICATION_STATUS.REJECTED && <Badge className="text-[9px] px-1 h-4 bg-red-500/10 text-red-500 border-red-500/20">NO</Badge>}
        
        <div className="flex gap-0.5 ml-1">
          <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-emerald-500/20 hover:text-emerald-400"
            onClick={() => handleUpdate(field, VERIFICATION_STATUS.VERIFIED)} disabled={loadingField === field || !linkKey}>
            {loadingField === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => handleUpdate(field, VERIFICATION_STATUS.REJECTED, note)} disabled={loadingField === field || !linkKey}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-200 leading-none">{member.name || "No Name"}</h4>
            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono uppercase tracking-wider">{member.role}</p>
          </div>
        </div>
        <div className={`h-2 w-2 rounded-full ${member.status === 2 ? 'bg-emerald-500' : 'bg-zinc-700'}`} title="Member Status" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
         <div className="space-y-0.5"><span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase"><Mail className="h-3 w-3"/> Email</span><p className="text-[11px] text-zinc-300 truncate" title={member.email}>{member.email}</p></div>
         <div className="space-y-0.5"><span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase"><Phone className="h-3 w-3"/> Phone</span><p className="text-[11px] text-zinc-300 truncate">{member.phoneNum || "-"}</p></div>
         <div className="space-y-0.5"><span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase"><Building className="h-3 w-3"/> Institution</span><p className="text-[11px] text-zinc-300 truncate" title={member.institution || ""}>{member.institution || "-"}</p></div>
         <div className="space-y-0.5"><span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase"><Hash className="h-3 w-3"/> ID</span><p className="text-[11px] text-zinc-300 truncate">{member.idNo || "-"}</p></div>
      </div>

      {/* Docs */}
      <div className="bg-zinc-950 rounded px-2 py-1 mb-2 border border-zinc-800/50 grow">
        {/* Note: Mapping component props (camelCase) to Server Action fields (snake_case) */}
        {renderDocRow("Student Card", member.scLink, member.scVerified, "sc_verified")}
        {renderDocRow("Student Data", member.sdLink, member.sdVerified, "sd_verified")}
        {renderDocRow("Follow Proof", member.fpLink, member.fpVerified, "fp_verified")}
        {renderDocRow("Share Proof", member.spLink, member.spVerified, "sp_verified")}
      </div>

      {/* Notes & Actions */}
      <div className="space-y-2 mt-auto">
        <div className="flex gap-2">
          <Input placeholder="Rejection reason..." value={note} onChange={(e) => setNote(e.target.value)} className="h-7 text-[10px] bg-zinc-950 border-zinc-800" />
          <Button size="icon" className="h-7 w-7 bg-zinc-800" onClick={() => handleUpdate("general_note", 0, note)} disabled={!note}><MessageSquare className="h-3.5 w-3.5" /></Button>
        </div>
        {member.notes && member.notes.length > 0 && (
           <div className="pt-2 border-t border-zinc-800/50 space-y-1 max-h-20 overflow-y-auto">
             {member.notes.map((n, i) => (
               <div key={i} className="text-[10px] text-zinc-400 bg-zinc-900/50 p-1.5 rounded flex justify-between group">
                 <span>{n}</span>
                 <button onClick={() => handleDeleteNote(n)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}