"use client";

import { useEffect, useState } from "react";
import { AssessmentCountdown } from "./AssessmentCountdown";
import { AssessmentStartButton } from "./AssessmentStartButton";
import { AlertTriangle } from "lucide-react";

export function AssessmentActionArea({ 
  startTimeISO, 
  teamId, 
}: { 
  startTimeISO: string;
  teamId: string;
}) {
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isWindowClosed, setIsWindowClosed] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date().getTime();
      const start = new Date(startTimeISO).getTime();
      const end = start + (48 * 60 * 60 * 1000);

      setIsWindowOpen(now >= start && now < end);
      setIsWindowClosed(now >= end);
    };

    checkTime();

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [startTimeISO]);

  if (isWindowClosed) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center text-destructive">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <h4 className="font-bold">Assessment Window Closed</h4>
        <p className="text-sm opacity-80">The 48-hour participation window has ended.</p>
      </div>
    );
  }

  if (isWindowOpen) {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-500">
        <div className="space-y-2 w-full max-w-sm">
           <h4 className="text-lg font-bold text-violet-700">
              Window is Open!
           </h4>
           <p className="text-sm text-muted-foreground mb-4">
              Clicking start will begin the 60-minute timer for <strong>your entire team</strong>.
           </p>
           
           <AssessmentStartButton 
             teamId={teamId} 
           />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-border/60 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Assessment Window Opens In
        </h4>
        <AssessmentCountdown targetDate={startTimeISO} />
        <p className="text-xs text-muted-foreground">
          {new Date(startTimeISO).toLocaleString('en-US', { timeZone: 'Asia/Jakarta', dateStyle: 'long', timeStyle: 'short' })} (GMT+7)
        </p>
    </div>
  );
}