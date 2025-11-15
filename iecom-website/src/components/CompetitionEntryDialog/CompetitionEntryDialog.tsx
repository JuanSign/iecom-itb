"use client";

import React, { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { createTeam as createIecom, joinTeam as joinIecom } from "@/actions/server/competition/iecom";
import { createTeam as createNice, joinTeam as joinNice } from "@/actions/server/competition/nice";
import { type CreateTeamFormState, type JoinTeamFormState } from "@/actions/types/Competition";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

type Props = {
  competition: "IECOM" | "NICE";
  competitionFullName: string;
  hasJoined: boolean;
};

const initialCreateState: CreateTeamFormState = {};
const initialJoinState: JoinTeamFormState = {};

export function CompetitionEntryDialog({
  competition,
  competitionFullName,
  hasJoined,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Action Wrappers
  const handleCreate = async (prevState: CreateTeamFormState, formData: FormData) => {
    if (competition === "IECOM") return createIecom(prevState, formData);
    else return createNice(prevState, formData);
  };

  const handleJoin = async (prevState: JoinTeamFormState, formData: FormData) => {
    if (competition === "IECOM") return joinIecom(prevState, formData);
    else return joinNice(prevState, formData);
  };

  // --- Server Actions ---
  const [createState, createAction, isCreating] = useActionState(handleCreate, initialCreateState);
  const [joinState, joinAction, isJoining] = useActionState(handleJoin, initialJoinState);

  // --- LOGIC FIX: Track which "version" of the state the user has dismissed/edited ---
  // We store the *entire* state object that the user has acted upon.
  const [dismissedCreateState, setDismissedCreateState] = useState<CreateTeamFormState | null>(null);
  const [dismissedJoinState, setDismissedJoinState] = useState<JoinTeamFormState | null>(null);

  // Calculate the Active Error inline (No useEffect needed)
  // If the current state from server is the same one we marked as dismissed, show nothing.
  const createError = createState === dismissedCreateState ? null : createState.error;
  const joinError = joinState === dismissedJoinState ? null : joinState.error;

  // --- Only use useEffect for Toast (Side Effects), NOT for UI state ---
  useEffect(() => {
    if (createState.error && createState !== dismissedCreateState) {
      toast.error(createState.error);
    }
  }, [createState, dismissedCreateState]);

  useEffect(() => {
    if (joinState.error && joinState !== dismissedJoinState) {
      toast.error(joinState.error);
    }
  }, [joinState, dismissedJoinState]);

  if (hasJoined) {
    return (
      <Button asChild className="text-white bg-blue-800 hover:bg-blue-900">
        <Link href={`/dashboard/${competition.toLowerCase()}/team`}>
          Enter Team Dashboard
        </Link>
      </Button>
    );
  }

  const handleOpenChange = (open: boolean) => {
  setIsOpen(open);
  if (!open) {
    setDismissedCreateState(null);
    setDismissedJoinState(null);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="text-white bg-blue-800 hover:bg-blue-900">
          Enter Competition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>You don&apos;t have a team for {competition} yet!</DialogTitle>
          <DialogDescription>
            To participate in the {competitionFullName}, you must belong to a team.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>

          {/* --- CREATE TEAM TAB --- */}
          <TabsContent value="create" className="space-y-4 py-4">
            <form action={createAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  name="teamName"
                  placeholder={`e.g. ${competition === "IECOM" ? "The Analysts" : "NICE Innovators"}`}
                  required
                  disabled={isCreating}
                  minLength={3}
                  // --- THE FIX IS HERE ---
                  // When user types, we tell React: "Ignore the current 'createState' object errors"
                  onChange={() => setDismissedCreateState(createState)}
                  
                  className={createError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {createError && (
                  <p className="text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                    {createError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-blue-800 hover:bg-blue-900 mt-2"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* --- JOIN TEAM TAB --- */}
          <TabsContent value="join" className="space-y-4 py-4">
            <form action={joinAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code</Label>
                <Input
                  id="teamCode"
                  name="teamCode"
                  placeholder="e.g. ABCDE"
                  required
                  disabled={isJoining}
                  maxLength={5}
                  style={{ textTransform: "uppercase" }}
                  // --- THE FIX IS HERE ---
                  onChange={() => setDismissedJoinState(joinState)}
                  
                  className={joinError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {joinError && (
                  <p className="text-sm font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                    {joinError}
                  </p>
                )}
                <p className="text-[0.8rem] text-muted-foreground">
                  Ask your team leader for the 5-letter code.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-blue-800 hover:bg-blue-900 mt-2"
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join Team"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t sm:justify-center">
          <Button variant="ghost" className="w-full sm:w-auto" disabled>
            <Search className="mr-2 h-4 w-4" />
            Need a team? (Coming Soon)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
