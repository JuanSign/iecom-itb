"use client";

import { useState } from "react";
import { updateMemberStatus, getSignedDocUrl } from "@/actions/server/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, ExternalLink, Loader2, User, Trash2, Mail, Phone, Building, Hash } from "lucide-react";
import { toast } from "sonner";
import { AdminMember } from "./AdminDataTable";

interface MemberManagerProps {
  member: AdminMember;
  teamId: number;
  competition: "NICE" | "IECOM";
}

export function MemberManager({ member, teamId, competition }: MemberManagerProps) {
  const [note, setNote] = useState("");
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

  const handleUpdate = async (field: string, value: number | string, noteContent?: string) => {
    setLoadingField(field);
    
    if (field === "general_note") {
        const res = await updateMemberStatus(competition, String(teamId), String(member.id), "general_note", value);
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Note Sent");
            setNote("");
        }
    } else {
        const res = await updateMemberStatus(competition, String(teamId), String(member.id), field, value);
        if (noteContent) {
            await updateMemberStatus(competition, String(teamId), String(member.id), "general_note", noteContent);
        }

        if (res?.error) toast.error(res.error);
        else {
            toast.success("Updated");
            if (noteContent) setNote("");
        }
    }
    setLoadingField(null);
  };

  const handleDeleteNote = async (noteText: string) => {
      const res = await updateMemberStatus(competition, String(teamId), String(member.id), "notes", noteText, "remove_note");
      if(res?.error) toast.error("Failed to delete note");
      else toast.success("Note deleted");
  }

  const handleOpenDoc = async (key: string | null, docName: string) => {
    if (!key) return;
    setOpeningDoc(docName);
    const res = await getSignedDocUrl(key);
    if (res.success && res.url) window.open(res.url, "_blank");
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
        {status === 2 && <Badge className="text-[9px] px-1 h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</Badge>}
        {status === 1 && <Badge className="text-[9px] px-1 h-4 bg-red-500/10 text-red-500 border-red-500/20">NO</Badge>}
        {status === 0 && <Badge className="text-[9px] px-1 h-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">-</Badge>}
        <div className="flex gap-0.5 ml-1">
          <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-emerald-500/20 hover:text-emerald-400"
            onClick={() => handleUpdate(field, 2)} disabled={loadingField === field || !linkKey}>
            {loadingField === field ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => handleUpdate(field, 1, note)} disabled={loadingField === field || !linkKey}>
             <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 flex flex-col h-full">
      {/* 1. Header: Name & Role */}
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
        <div className={`h-2 w-2 rounded-full ${member.status === 2 ? 'bg-emerald-500' : member.status === 1 ? 'bg-yellow-500' : 'bg-zinc-700'}`} title="Member Status"/>
      </div>

      {/* 2. Personal Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 bg-zinc-950/50 p-2 rounded border border-zinc-800/50">
        <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                <Mail className="h-3 w-3" /> Email
            </div>
            <p className="text-[11px] text-zinc-300 font-medium truncate" title={member.email}>{member.email}</p>
        </div>
        <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                <Phone className="h-3 w-3" /> Phone
            </div>
            <p className="text-[11px] text-zinc-300 font-medium truncate">{member.phone_num || "-"}</p>
        </div>
        <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                <Building className="h-3 w-3" /> Institution
            </div>
            <p className="text-[11px] text-zinc-300 font-medium truncate" title={member.institution || ""}>{member.institution || "-"}</p>
        </div>
        <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wide">
                <Hash className="h-3 w-3" /> ID Number
            </div>
            <p className="text-[11px] text-zinc-300 font-medium truncate">{member.id_no || "-"}</p>
        </div>
      </div>

      {/* 3. Documents List */}
      <div className="bg-zinc-950 rounded px-2 py-1 mb-2 border border-zinc-800/50 grow">
        {renderDocRow("Student Card", member.sc_link, member.sc_verified, "sc_verified")}
        {renderDocRow("Student Data", member.sd_link, member.sd_verified, "sd_verified")}
        {renderDocRow("Follow Proof", member.fp_link, member.fp_verified, "fp_verified")}
        {renderDocRow("Share Proof", member.sp_link, member.sp_verified, "sp_verified")}
      </div>

      {/* 4. Notes & Rejection */}
      <div className="space-y-2 mt-auto">
        <div className="flex gap-2">
            <Input 
                placeholder="Rejection reason / Note..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-7 text-[10px] bg-zinc-950 border-zinc-800 placeholder:text-zinc-700"
            />
            <Button 
                size="icon" className="h-7 w-7 bg-zinc-800 hover:bg-zinc-700 shrink-0"
                onClick={() => handleUpdate("general_note", note)}
                disabled={!note}
            >
                <MessageSquare className="h-3.5 w-3.5" />
            </Button>
        </div>
        
        {member.notes && member.notes.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/50">
                <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
                    {member.notes.map((n, i) => (
                        <div key={i} className="text-[10px] text-zinc-400 bg-zinc-900/50 p-1.5 rounded flex justify-between items-start group">
                            <span>{n}</span>
                            <button onClick={() => handleDeleteNote(n)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}