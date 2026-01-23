"use client";

import { useState } from "react";
import { updateTeamStatus } from "@/actions/server/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { TeamData, CompetitionType } from "@/actions/types/Admin";

export function EditTeamDialog({ team, competition }: { team: TeamData; competition: CompetitionType }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setIsLoading(true);
        const field = formData.get("field") as string;
        const value = formData.get("value") as string;
        
        const res = await updateTeamStatus(competition, team.teamId, field, value);
        setIsLoading(false);
        
        if(res?.error) toast.error(res.error);
        else {
            toast.success("Team updated");
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                    <Edit className="h-3 w-3 mr-2" /> Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Team</DialogTitle>
                    <DialogDescription className="text-zinc-500">{team.name} (#{team.code})</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                    {/* Common Pipeline Status */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300">Team Status</h4>
                        <form action={handleUpdate} className="flex gap-2 items-end">
                            <input type="hidden" name="field" value="status" />
                            <div className="w-full">
                                <Select name="value" defaultValue={String(team.status)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-700"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="0">0 - Waiting Members</SelectItem>
                                        <SelectItem value="1">1 - In Progress</SelectItem>
                                        <SelectItem value="2">2 - Active</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" size="sm" disabled={isLoading}>Save</Button>
                        </form>
                    </div>

                    {/* Payment Verification (Shared but different DB fields) */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-300">Payment Check</h4>
                        <form action={handleUpdate} className="flex gap-2 items-end">
                            {/* NOTE: Field name must match Database column (snake_case) */}
                            <input type="hidden" name="field" value={competition === "IECOM" ? "pp_verified" : "payment_verified"} />
                            <div className="w-full">
                                <Select name="value" defaultValue={String(competition === "IECOM" ? team.ppVerified : team.paymentVerified)}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-700"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="0">0 - Pending</SelectItem>
                                        <SelectItem value="1">1 - Rejected</SelectItem>
                                        <SelectItem value="2">2 - Verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>Save</Button>
                        </form>
                    </div>

                    {/* NICE Specific: Submission Stage */}
                    {competition === "NICE" && (
                        <div className="space-y-3 pt-4 border-t border-zinc-800">
                            <h4 className="text-sm font-semibold text-zinc-300">NICE Stage</h4>
                            <form action={handleUpdate} className="flex gap-2 items-end">
                                <input type="hidden" name="field" value="submission_status" />
                                <div className="w-full">
                                    <Select name="value" defaultValue={String(team.submissionStatus ?? 0)}>
                                        <SelectTrigger className="bg-zinc-950 border-zinc-700"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="0">Stage 0</SelectItem>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}