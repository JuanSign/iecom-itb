"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startTeamAssessment } from "@/actions/server/competition/iecom/start-assesment";
import { Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner"; 

export function AssessmentStartButton({ 
  teamId, 
}: { 
  teamId: string; 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    try {
      setIsLoading(true);
      await startTeamAssessment(teamId);
    } catch {
      toast.error("Failed to start assessment");
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleStart} 
      disabled={isLoading}
      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition-all"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing Assesment...
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Assessment Now
        </>
      )}
    </Button>
  );
}