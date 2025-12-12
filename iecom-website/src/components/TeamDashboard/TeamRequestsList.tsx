'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, UserPlus, School } from 'lucide-react';
import { approveRequest, declineRequest } from '@/actions/server/competition/team-management';
import { toast } from 'sonner';

type Request = {
  id: string;
  name: string;
  institution: string;
  description: string;
  created_at: string;
};

interface TeamRequestsListProps {
  requests: Request[];
  teamId: string;
  type: 'iecom' | 'nice'; // <--- Added Prop
}

export function TeamRequestsList({ requests, teamId, type }: TeamRequestsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(reqId: string) {
    setLoadingId(reqId);
    // Pass 'type'
    const res = await approveRequest(reqId, teamId, type);
    setLoadingId(null);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  }

  async function handleDecline(reqId: string) {
    setLoadingId(reqId);
    // Pass 'type'
    const res = await declineRequest(reqId, teamId, type);
    setLoadingId(null);
    if (res.success) toast.info(res.message);
    else toast.error(res.message);
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 border-dashed border rounded-lg">
        <UserPlus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No pending join requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card shadow-sm">
          
          <div className="flex items-start gap-3">
             <Avatar className="h-10 w-10">
               <AvatarFallback>{req.name.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
             <div>
               <div className="flex items-center gap-2">
                 <p className="font-semibold text-sm">{req.name}</p>
                 <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                    <School className="w-3 h-3 mr-1" />
                    {req.institution}
                 </Badge>
               </div>
               {req.description && (
                 <p className="text-sm text-muted-foreground mt-1 bg-muted/30 p-2 rounded-md italic">
                   &quot;{req.description}&quot;
                 </p>
               )}
               <p className="text-xs text-muted-foreground mt-1">
                 Requested {new Date(req.created_at).toLocaleDateString()}
               </p>
             </div>
          </div>

          <div className="flex gap-2 sm:self-center self-end">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              disabled={loadingId === req.id}
              onClick={() => handleDecline(req.id)}
            >
              <X className="w-4 h-4 mr-1" /> Decline
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loadingId === req.id}
              onClick={() => handleApprove(req.id)}
            >
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}