"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { submitAnswer } from "@/actions/server/competition/iecom/submit-answer";
import { finishExam } from "@/actions/server/competition/iecom/finish-assesment";
import { Loader2, Timer, ChevronRight, ChevronLeft, AlertTriangle, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// --- TYPES ---
export type SafeProblem = {
  id: number;
  content: string;
  imageUrl: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  options: { id: string; type: 'text' | 'image'; value: string }[];
  initialAnswerId?: string; 
};

export function ExamInterface({ 
  problems = [], // Default to empty array to prevent crashes
  endTime,
}: { 
  problems: SafeProblem[]; 
  endTime: number; 
}) {
  
  // --------------------------------------------------------
  // 1. DEFINE ALL HOOKS FIRST (Unconditionally)
  // --------------------------------------------------------

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    if (problems && problems.length > 0) {
      problems.forEach(p => { 
        if (p.initialAnswerId) initial[p.id] = p.initialAnswerId; 
      });
    }
    return initial;
  });
  
  const [isPending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState<string>("Initializing...");

  // Anti-Cheat State
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const STRIKE_LIMIT = 3;
  const GRACE_PERIOD_MS = 5000;

  // Helper: Trigger Finish (Wrapped in useCallback)
  const handleFinishExam = useCallback(async (reason: string) => {
    try {
      await finishExam(reason); 
    } catch{
      // Ignore redirect errors
    }
  }, []);

  // Effect: Anti-Cheat
  useEffect(() => {
    const handleBlur = () => {
      blurTimeoutRef.current = setTimeout(() => {
        setStrikes((prev) => {
          const newStrikes = prev + 1;
          if (newStrikes >= STRIKE_LIMIT) {
             handleFinishExam("Disqualified: Tab switching limit exceeded.");
          } else {
             setShowWarning(true);
          }
          return newStrikes;
        });
      }, GRACE_PERIOD_MS);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    const handleVisChange = () => {
       if (document.hidden) handleBlur();
       else handleFocus();
    };
    document.addEventListener("visibilitychange", handleVisChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisChange);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [STRIKE_LIMIT, handleFinishExam]);

  // Effect: Timer
  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        handleFinishExam("Time Limit Reached"); 
        return true; 
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
      return false;
    };

    if (checkTime()) return;

    const timer = setInterval(() => {
      if (checkTime()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, handleFinishExam]);

  // --------------------------------------------------------
  // 2. EARLY RETURN (Safe Loading State)
  // --------------------------------------------------------
  
  if (!problems || problems.length === 0) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-muted-foreground">Loading Exam Content...</p>
         </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // 3. MAIN RENDER LOGIC
  // --------------------------------------------------------

  const currentProblem = problems[currentIndex];
  const isLastQuestion = currentIndex === problems.length - 1;

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentProblem.id]: optionId }));
    startTransition(async () => {
      try {
        await submitAnswer(currentProblem.id, optionId);
      } catch {
        toast.error("Could not save answer. Check internet.");
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6 p-4 max-w-7xl mx-auto">
      
      {/* --- WARNING MODAL --- */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="border-red-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Warning: Distraction Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              You left the exam window for more than 5 seconds. This is <strong>STRIKE {strikes}/{STRIKE_LIMIT}</strong>.
              <br /><br />
              Reaching {STRIKE_LIMIT} strikes will <strong>disqualify you immediately</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarning(false)} className="bg-red-600 hover:bg-red-700">
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- LEFT PANEL --- */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <Card className="flex-1 flex flex-col shadow-md border-t-4 border-t-violet-500 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 mb-1">
               <Badge variant={
                  currentProblem.difficulty === 'easy' ? 'secondary' :
                  currentProblem.difficulty === 'medium' ? 'default' : 'destructive'
               }>
                  {currentProblem.difficulty.toUpperCase()}
               </Badge>
               <span className="text-sm text-muted-foreground">Q{currentIndex + 1}/{problems.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
                {strikes > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                        <EyeOff className="w-3 h-3 mr-1" /> {strikes} Strike{strikes > 1 ? 's' : ''}
                    </Badge>
                )}
                <div className="flex items-center gap-2 font-mono text-xl font-bold px-3 py-1 rounded-md border text-violet-600 bg-violet-50 border-violet-100">
                  <Timer className="w-5 h-5" />
                  {timeLeft}
                </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-xl font-medium leading-relaxed text-foreground mb-6">
              {currentProblem.content}
            </h3>

            {currentProblem.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden border border-border bg-muted/20 flex justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentProblem.imageUrl} alt="Problem Diagram" className="max-h-[400px] object-contain w-auto shadow-sm" />
              </div>
            )}

            <RadioGroup 
              value={answers[currentProblem.id] || ""} 
              onValueChange={handleOptionSelect}
              className="space-y-4"
            >
              {currentProblem.options.map((option) => (
                <div key={option.id} className={cn(
                  "flex items-start space-x-3 rounded-lg border p-4 transition-all cursor-pointer hover:bg-muted/40",
                  answers[currentProblem.id] === option.id 
                    ? "border-violet-500 bg-violet-50/30 ring-1 ring-violet-500" 
                    : "border-border"
                )}>
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal">
                    {option.type === 'text' ? (
                      <span className="text-base leading-relaxed block py-0.5">{option.value}</span>
                    ) : (
                      <div className="mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={option.value} alt="Option" className="max-h-40 rounded-md border border-border/60" />
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t bg-muted/10 flex justify-between items-center shrink-0">
             <Button 
                variant="outline" 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
             >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
             </Button>

             <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                {isPending ? (
                    <><Loader2 className="w-3 h-3 animate-spin text-violet-600" /> Saving...</>
                ) : (
                    <><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Saved</>
                )}
             </div>

             <Button 
                onClick={() => {
                  if (isLastQuestion) {
                     handleFinishExam("Normal Submission");
                  } else {
                     setCurrentIndex(prev => Math.min(problems.length - 1, prev + 1));
                  }
                }}
                className={isLastQuestion ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
             >
                {isLastQuestion ? "Submit All" : "Next"} <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </Card>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-80 hidden lg:flex flex-col gap-4 shrink-0">
        <Card className="h-full border-none shadow-none bg-transparent">
          <CardContent className="p-0 space-y-4">
             {/* Status Legend */}
             <div className="bg-card border rounded-lg p-4 shadow-sm space-y-2">
              <h4 className="font-semibold text-sm mb-2">Status</h4>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-violet-600" /> Done</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-muted border" /> Todo</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full ring-2 ring-violet-500" /> Now</div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="bg-card border rounded-lg p-4 shadow-sm">
               <div className="grid grid-cols-5 gap-2">
                 {problems.map((p, idx) => {
                   const isAnswered = !!answers[p.id];
                   const isCurrent = idx === currentIndex;
                   
                   return (
                     <button
                       key={p.id}
                       onClick={() => setCurrentIndex(idx)}
                       className={cn(
                         "h-10 w-10 rounded-md text-sm font-medium transition-all flex items-center justify-center",
                         isCurrent 
                            ? "ring-2 ring-violet-600 bg-background text-foreground border border-violet-600 z-10" 
                            : isAnswered
                              ? "bg-violet-600 text-white border-violet-700 hover:bg-violet-700"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 border"
                       )}
                     >
                       {idx + 1}
                     </button>
                   )
                 })}
               </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
               <div className="flex gap-2">
                  <EyeOff className="w-5 h-5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs uppercase mb-1">Anti-Cheat Active</h5>
                    <p className="text-[11px] leading-relaxed">
                       Leaving this tab for more than 5 seconds will result in a strike. 3 strikes will disqualify you.
                    </p>
                  </div>
               </div>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
}