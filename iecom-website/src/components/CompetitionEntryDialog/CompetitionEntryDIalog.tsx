"use client";

import React, { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { toast } from "sonner";
import { joinTeam, createTeam } from "@/actions/server/competition";
import { type TeamFormState } from "@/actions/types/Team";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Users, UserPlus, Loader2, Search } from "lucide-react";

type Props = {
  competition: "IECOM" | "NICE";
  competitionFullName: string;
  hasJoined: boolean;
};

const initialCreateState: TeamFormState = {};
const initialJoinState: TeamFormState = {};

export function CompetitionEntryDialog({
  competition,
  competitionFullName,
  hasJoined,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // 2. Get router instance

  // These actions are now generic and will be used by both forms
  const [createState, createAction, isCreating] = useActionState(
    createTeam,
    initialCreateState
  );
  const [joinState, joinAction, isJoining] = useActionState(
    joinTeam,
    initialJoinState
  );

  useEffect(() => {
    if (createState?.error) {
      toast.error(createState.error);
    }
    if (joinState?.error) {
      toast.error(joinState.error);
    }

    // 3. This is the new success handler
    const handleSuccess = (comp: "IECOM" | "NICE") => {
      toast.success(`Successfully joined team for ${comp}!`);
      
      // We push the redirect to the next tick to ensure state updates
      // and toasts are processed before the page unloads.
      setTimeout(() => {
        setIsOpen(false);
        // router.refresh() tells Next.js to re-fetch the dashboard page
        // so it sees your new session.events array
        router.refresh();
        router.push(`/dashboard/competition/${comp.toLowerCase()}`);
      }, 0);
    };

    // 4. Check for success and call the handler
    if (createState?.success) {
      handleSuccess(competition);
    }
    if (joinState?.success) {
      handleSuccess(competition);
    }
    // We disable the exhaustive-deps rule here because we ONLY
    // want this effect to run when createState or joinState change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createState, joinState, router]);

  // 1. If user has joined, show a simple link
  if (hasJoined) {
    return (
      <Button
        asChild
        className="text-white bg-blue-800 hover:bg-blue-900"
      >
        <Link href={`/dashboard/competition/${competition.toLowerCase()}`}>
          Enter
        </Link>
      </Button>
    );
  }

  // 2. If not joined, show the Dialog Trigger
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-white bg-blue-800 hover:bg-blue-900">
          Enter
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
              <input type="hidden" name="competition" value={competition} />
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
                />
              </div>

              <div className="space-y-2">
                <Label>Select your Role</Label>
                {/* Radio buttons are now visible by default */}
                <RadioGroup
                  defaultValue="MEMBER"
                  name="role"
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="c-manager"
                    className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-checked:bg-accent has-checked:border-primary"
                  >
                    <RadioGroupItem value="MANAGER" id="c-manager" />
                    <span className="flex items-center gap-2 w-full">
                      <UserPlus className="w-4 h-4" /> Manager
                    </span>
                  </Label>
                  <Label
                    htmlFor="c-member"
                    className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-checked:bg-accent has-checked:border-primary"
                  >
                    <RadioGroupItem value="MEMBER" id="c-member" />
                    <span className="flex items-center gap-2 w-full">
                      <Users className="w-4 h-4" /> Member
                    </span>
                  </Label>
                </RadioGroup>
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
                  "Create"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* --- JOIN TEAM TAB --- */}
          <TabsContent value="join" className="space-y-4 py-4">
            <form action={joinAction} className="flex flex-col gap-4">
              <input type="hidden" name="competition" value={competition} />
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code</Label>
                <Input
                  id="teamCode"
                  name="teamCode"
                  placeholder="e.g. ABCDE"
                  required
                  disabled={isJoining}
                />
              </div>

              <div className="space-y-2">
                <Label>Select your Role</Label>
                <RadioGroup
                  defaultValue="MEMBER"
                  name="role"
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="j-manager"
                    className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-checked:bg-accent has-checked:border-primary"
                  >
                    <RadioGroupItem value="MANAGER" id="j-manager" />
                    <span className="flex items-center gap-2 w-full">
                      <UserPlus className="w-4 h-4" /> Manager
                    </span>
                  </Label>
                  <Label
                    htmlFor="j-member"
                    className="flex items-center space-x-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-checked:bg-accent has-checked:border-primary"
                  >
                    <RadioGroupItem value="MEMBER" id="j-member" />
                    <span className="flex items-center gap-2 w-full">
                      <Users className="w-4 h-4" /> Member
                    </span>
                  </Label>
                </RadioGroup>
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
                  "Join"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* 3. "Find a Team" Button */}
        <DialogFooter className="pt-4 border-t sm:justify-center">
          <Button variant="ghost" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Don&apos;t have a team yet? Find one!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}