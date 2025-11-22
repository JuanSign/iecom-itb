"use client";

import { useState } from "react";
import { updateTeamStatus } from "@/actions/server/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { AdminTeam } from "./AdminDataTable"; // Import the type

export function EditTeamDialog({ 
  team, 
  competition 
}: { 
  team: AdminTeam; 
  competition: "NICE" | "IECOM" 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (formData: FormData) => {
        setIsLoading(true);
        const field = formData.get("field") as string;
        const value = parseInt(formData.get("value") as string);
        const note = formData.get("note") as string;

        const res = await updateTeamStatus(competition, team.team_id, field, value, note);
        setIsLoading(false);
        
        if(res?.error) toast.error(res.error);
        else {
            toast.success("Status updated successfully");
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
                    <DialogDescription className="text-zinc-500">
                        {team.team_name} ({team.code})
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                    
                    {/* SECTION 1: Payment Verification */}
                    <div className="space-y-3 border-b border-zinc-800 pb-4">
                        <h4 className="text-sm font-semibold text-zinc-300">Payment Verification</h4>
                        <form action={handleUpdate} className="space-y-3">
                            <input type="hidden" name="field" value="pp_verified" />
                            <div className="grid grid-cols-2 gap-2">
                                <Button type="submit" name="value" value="2" size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : "Mark Verified"}
                                </Button>
                                <Button type="submit" name="value" value="1" size="sm" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                                    Reject
                                </Button>
                            </div>
                            <Input name="note" placeholder="Reason for rejection (optional)" className="bg-zinc-950 border-zinc-700 text-sm" />
                        </form>
                    </div>

                     {/* SECTION 2: Competition Stage */}
                     <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-zinc-300">Submission Stage</h4>
                        <form action={handleUpdate} className="grid grid-cols-3 gap-2">
                            <input type="hidden" name="field" value="submission_status" />
                            
                            <Button type="submit" name="value" value="1" size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800" disabled={isLoading}>
                                Stage 1
                            </Button>
                            <Button type="submit" name="value" value="2" size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800" disabled={isLoading}>
                                Stage 2
                            </Button>
                             <Button type="submit" name="value" value="3" size="sm" variant="outline" className="border-zinc-700 hover:bg-zinc-800" disabled={isLoading}>
                                Stage 3
                            </Button>
                        </form>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}