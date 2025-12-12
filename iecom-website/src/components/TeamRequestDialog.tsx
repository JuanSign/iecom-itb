'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { requestJoinTeam } from '@/actions/server/competition/find-team';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; 

interface TeamRequestDialogProps {
  teamId: string;
  teamName: string;
  type: 'iecom' | 'nice';
}

export function TeamRequestDialog({ teamId, teamName, type }: TeamRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    formData.append('teamId', teamId);
    formData.append('type', type);

    const result = await requestJoinTeam(null, formData);
    
    setIsLoading(false);

    if (result.success) {
        setOpen(false);
        toast.success(result.message);
    } else {
        toast.error(result.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/25 transition-all duration-300"
        >
          Request to Join Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black/90 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Join {teamName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a request to the team leader. They will see your details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-gray-200">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="institution" className="text-gray-200">Institution</Label>
            <Input id="institution" name="institution" placeholder="University of X" required className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-gray-200">Short Bio / Note (Optional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Hi! I'm a 3rd year student specializing in..." 
              className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50 min-h-[100px]" 
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}