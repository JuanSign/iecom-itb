"use client";

import { useState } from "react";
import { updateTeamStatus } from "@/actions/server/admin";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Loader2, Send, Trash2 } from "lucide-react";
import { AdminTeam } from "./AdminDataTable";

export function EditTeamDialog({ team, competition }: { team: AdminTeam; competition: "NICE" | "IECOM" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setIsLoading(true);
        const field = formData.get("field") as string;
        const value = formData.get("value") as string;
        
        const res = await updateTeamStatus(competition, team.team_id, field, value);
        setIsLoading(false);
        
        if(res?.error) toast.error(res.error);
        else toast.success(res.message);
    };

    const handleDeleteNote = async (noteText: string) => {
        const res = await updateTeamStatus(competition, team.team_id, "notes", noteText, "remove_note");
        if(res?.error) toast.error("Failed to delete note");
        else toast.success("Note deleted");
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                    <Edit className="h-3 w-3 mr-2" /> Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Team</DialogTitle>
                    <DialogDescription className="text-zinc-500">{team.team_name} (#{team.code})</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                    
                    {/* 1. General Status (For both comps) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300">Team Status (Pipeline)</h4>
                        <form action={handleUpdate} className="flex gap-2 items-end">
                            <input type="hidden" name="field" value="status" />
                            <div className="w-full">
                                <Select name="value" defaultValue={String(team.status)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="0">0 - Waiting for Members</SelectItem>
                                        <SelectItem value="1">1 - {competition === "IECOM" ? "Waiting Payment" : "Waiting Submission"}</SelectItem>
                                        <SelectItem value="2">2 - Accepted / Active</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" size="sm" className="bg-zinc-800 hover:bg-zinc-700" disabled={isLoading}>Update</Button>
                        </form>
                    </div>

                    {/* 2. IECOM Specific: Payment Status */}
                    {competition === "IECOM" && (
                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <h4 className="text-sm font-semibold text-zinc-300">Payment Verification</h4>
                            <form action={handleUpdate} className="flex gap-2 items-end">
                                <input type="hidden" name="field" value="pp_verified" />
                                <div className="w-full">
                                    <Select name="value" defaultValue={String(team.pp_verified)}>
                                        <SelectTrigger className="bg-zinc-950 border-zinc-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="0">0 - Pending Check</SelectItem>
                                            <SelectItem value="1">1 - Rejected</SelectItem>
                                            <SelectItem value="2">2 - Verified</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>Save</Button>
                            </form>
                        </div>
                    )}

                    {/* 3. NICE Specific: Submission Stage */}
                    {competition === "NICE" && (
                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <h4 className="text-sm font-semibold text-zinc-300">Submission Stage</h4>
                            <form action={handleUpdate} className="flex gap-2 items-end">
                                <input type="hidden" name="field" value="submission_status" />
                                <div className="w-full">
                                    <Select name="value" defaultValue={String(team.submission_status)}>
                                        <SelectTrigger className="bg-zinc-950 border-zinc-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="0">Stage 0 (Registered)</SelectItem>
                                            <SelectItem value="1">Stage 1</SelectItem>
                                            <SelectItem value="2">Stage 2</SelectItem>
                                            <SelectItem value="3">Stage 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>Save</Button>
                            </form>
                        </div>
                    )}

                    {/* 4. Notes Manager */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Send className="h-3 w-3" /> Team Notes
                        </h4>
                        
                        {/* List Existing Notes */}
                        {team.notes && team.notes.length > 0 && (
                            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto border border-zinc-800 rounded p-2 bg-zinc-950/50">
                                {team.notes.map((n, i) => (
                                    <div key={i} className="flex justify-between items-start gap-2 text-xs text-zinc-400 bg-zinc-900 p-2 rounded group">
                                        <span>{n}</span>
                                        <button onClick={() => handleDeleteNote(n)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New Note */}
                        <form action={handleUpdate} className="flex gap-2">
                            <input type="hidden" name="field" value="general_note" />
                            <Input name="value" required placeholder="Add a new note..." className="bg-zinc-950 border-zinc-700 text-sm" />
                            <Button type="submit" size="icon" className="bg-zinc-800 hover:bg-zinc-700 shrink-0" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}