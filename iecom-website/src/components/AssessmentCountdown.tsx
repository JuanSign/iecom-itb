"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function AssessmentCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference < 0) {
        setIsLive(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isLive) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-bold animate-pulse">
        <Clock className="w-4 h-4" />
        Assessment Window is LIVE
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="bg-muted px-3 py-2 rounded-md min-w-12 font-mono text-xl font-bold border border-border">
            {value.toString().padStart(2, "0")}
          </div>
          <span className="text-[10px] uppercase text-muted-foreground mt-1 font-medium">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}