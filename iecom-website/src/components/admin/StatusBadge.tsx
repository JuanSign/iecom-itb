import { Badge } from "@/components/ui/badge";
import { VERIFICATION_STATUS, VerificationStatus } from "@/actions/types/Admin";

interface StatusBadgeProps {
  status: number | VerificationStatus;
  type?: "verification" | "pipeline";
  label?: string;
}

export const StatusBadge = ({ status, type = "verification", label }: StatusBadgeProps) => {
  if (type === "verification") {
    if (status === VERIFICATION_STATUS.VERIFIED) 
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Verified</Badge>;
    if (status === VERIFICATION_STATUS.REJECTED) 
      return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Check</Badge>;
  }

  // Pipeline / Team Status Logic
  if (status === 2) return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
  if (status === 1) return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">{label || "In Progress"}</Badge>;
  
  return <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">Waiting</Badge>;
};