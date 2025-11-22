"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Hourglass,
  CheckCircle2,
  ScrollText,
  Info,
  BookText,
  CreditCard,
  AlertCircle,
} from "lucide-react";

// --- CONFIGURATION ---

type StatusConfig = {
  icon: React.ReactNode;
  className: string;
  label: string; // To ensure consistent labeling
};

function getStatusConfig(text: string): StatusConfig {
  const normalizedText = text?.trim();

  switch (normalizedText) {
    case "Waiting for Team Member Verification":
      return {
        icon: <Hourglass className="h-4 w-4" />,
        label: "Verification Pending",
        className:
          "text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/50",
      };

    case "Waiting for Payment":
      return {
        icon: <CreditCard className="h-4 w-4" />,
        label: "Payment Pending",
        className:
          "text-orange-500 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50",
      };

    case "Accepted":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: "Team Accepted",
        className:
          "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50",
      };

    case "Documents Submission Open":
      return {
        icon: <BookText className="h-4 w-4" />,
        label: "Submission Open",
        className:
          "text-blue-500 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50",
      };

    default:
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        label: text || "Unknown Status",
        className:
          "text-muted-foreground border-border bg-muted/50 hover:bg-muted",
      };
  }
}

export function TeamStatusBadge({
  statusText,
  notes,
}: {
  statusText: string;
  status?: number | null; 
  notes: string[] | null;
}) {
  const config = getStatusConfig(statusText);

  const rawNotes = notes || [];
  const notesCount = rawNotes.length;
  const hasNotes = notesCount > 0;

  const notesToDisplay = hasNotes ? rawNotes : ["No specific notes provided."];

  const StatusIcon = (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "relative h-9 w-9 transition-all duration-200 shadow-sm",
        config.className
      )}
    >
      {config.icon}
      {hasNotes && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background shadow-sm">
          {notesCount}
        </span>
      )}
    </Button>
  );

  if (!hasNotes) {
    return <div title={config.label}>{StatusIcon}</div>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {StatusIcon}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <ScrollText className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h4 className="text-sm font-semibold leading-none tracking-tight">
              Admin Notes
            </h4>
            <p className="text-xs text-muted-foreground mt-1 truncate" title={statusText}>
              Status: <span className="font-medium text-foreground">{config.label}</span>
            </p>
          </div>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
            {notesToDisplay.map((note, index) => (
              <div
                key={index}
                className="relative flex gap-3 rounded-md border border-border/50 bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/60"
              >
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90 text-xs leading-relaxed">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/40 p-2 border-t border-border text-center">
           <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
             {notesCount} {notesCount === 1 ? 'Message' : 'Messages'}
           </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}