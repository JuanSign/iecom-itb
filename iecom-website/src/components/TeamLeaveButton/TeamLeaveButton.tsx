"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { leaveTeam as leaveTeamIECOM } from "@/actions/server/competition/iecom";
import { leaveTeam as leaveTeamNICE } from "@/actions/server/competition/nice";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeamLeaveButtonProps {
  event: "IECOM" | "NICE";
}

export function TeamLeaveButton({ event }: TeamLeaveButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLeave = () => {
    startTransition(async () => {
      toast.info(`Leaving ${event} team...`);
      
      try {
        if (event === "IECOM") {
          await leaveTeamIECOM();
        } else {
          await leaveTeamNICE();
        }
      } catch (error) {
        toast.error("Failed to leave team. Please try again.");
        console.error(error);
      }
    });
  };

  const redButtonClasses = "bg-red-600 text-white hover:bg-red-700";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={cn("ml-auto", redButtonClasses)}
          disabled={isPending}
        >
          Leave Team
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be removed from this <strong>{event}</strong> team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isPending}
            className={cn(redButtonClasses)}
          >
            {isPending ? "Leaving..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}