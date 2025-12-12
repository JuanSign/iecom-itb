'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, MessageSquare } from 'lucide-react';
import { addTeamMessage, removeTeamMessage } from '@/actions/server/competition/team-management';
import { toast } from 'sonner';

interface TeamDescriptionManagerProps {
  teamId: string;
  messages: string[];
  type: 'iecom' | 'nice'; // <--- Added Prop
}

export function TeamDescriptionManager({ teamId, messages, type }: TeamDescriptionManagerProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd() {
    if (!newMessage.trim()) return;
    setIsLoading(true);
    // Pass 'type' to server action
    const res = await addTeamMessage(teamId, newMessage, type);
    setIsLoading(false);
    if (res.success) {
      setNewMessage('');
      toast.success("Note added");
    } else {
      toast.error(res.message);
    }
  }

  async function handleRemove(index: number) {
    // Pass 'type' to server action
    const res = await removeTeamMessage(teamId, index, type);
    if (res.success) toast.success("Note removed");
    else toast.error(res.message);
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2 mb-2">
         <MessageSquare className="w-4 h-4 text-muted-foreground" />
         <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Public Team Notes</h4>
       </div>
       
       <div className="space-y-2">
         {messages && messages.map((msg, idx) => (
           <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-muted-foreground/10 text-sm">
             <span>{msg}</span>
             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleRemove(idx)}>
               <X className="w-3 h-3" />
             </Button>
           </div>
         ))}
         {(!messages || messages.length === 0) && (
            <p className="text-sm text-muted-foreground italic">No notes added. Add notes to help others find your team.</p>
         )}
       </div>

       <div className="flex gap-2 pt-2">
         <Input 
           placeholder="e.g. We are looking for a coder..." 
           value={newMessage}
           onChange={(e) => setNewMessage(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
           className="bg-background"
         />
         <Button onClick={handleAdd} disabled={isLoading} size="sm">
           <Plus className="w-4 h-4 mr-1" /> Add
         </Button>
       </div>
    </div>
  );
}