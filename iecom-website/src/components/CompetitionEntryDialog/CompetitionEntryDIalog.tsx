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

  // 1. Dynamic Wrapper for Create Action
  const handleCreate = async (prevState: CreateTeamFormState, formData: FormData) => {
    if (competition === "IECOM") {
      return createIecom(prevState, formData);
    } else {
      return createNice(prevState, formData);
    }
  };

  // 2. Dynamic Wrapper for Join Action
  const handleJoin = async (prevState: JoinTeamFormState, formData: FormData) => {
    if (competition === "IECOM") {
      return joinIecom(prevState, formData);
    } else {
      return joinNice(prevState, formData);
    }
  };

  const [createState, createAction, isCreating] = useActionState(
    handleCreate,
    initialCreateState
  );

  const [joinState, joinAction, isJoining] = useActionState(
    handleJoin,
    initialJoinState
  );

  // 3. Error Handling
  // Success handling is managed by the 'redirect' in your server actions
  useEffect(() => {
    if (createState?.error) {
      toast.error(createState.error);
    }
    if (joinState?.error) {
      toast.error(joinState.error);
    }
  }, [createState, joinState]);

  // 4. If already joined, just show the Enter button
  if (hasJoined) {
    return (
      <Button
        asChild
        className="text-white bg-blue-800 hover:bg-blue-900"
      >
        <Link href={`/dashboard/${competition.toLowerCase()}/team`}>
          Enter Team Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-white bg-blue-800 hover:bg-blue-900">
          Enter Competition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            You don&apos;t have a team for {competition} yet!
          </DialogTitle>
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
                  placeholder={`e.g. ${
                    competition === "IECOM" ? "The Analysts" : "NICE Innovators"
                  }`}
                  required
                  disabled={isCreating}
                  minLength={3}
                />
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
                  style={{ textTransform: "uppercase" }} // Visual helper
                />
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