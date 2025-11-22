"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Hourglass,
  XCircle,
  CheckCircle2,
  ScrollText,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusConfig = {
  icon: React.ReactNode;
  className: string;
  label: string;
};

// Using specific colors for status to ensure they pop against the dark background
// but blending them with alpha values for a "glassy" feel.
const statusMap: Record<number, StatusConfig> = {
  0: {
    icon: <Hourglass className="h-4 w-4" />,
    label: "Pending",
    className:
      "text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/50",
  },
  1: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Rejected",
    className:
      "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50",
  },
  2: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Approved",
    className:
      "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50",
  },
};

export function MemberStatusBadge({
  status,
  notes,
}: {
  status: number | null;
  notes: string[] | null;
}) {
  const finalStatus = statusMap[status || 0];

  const rawNotes = notes || [];
  const notesToDisplay =
    rawNotes.length > 0
      ? rawNotes
      : ["No specific notes provided."];

  const notesCount = rawNotes.length;
  const hasNotes = notesCount > 0;

  const StatusIcon = (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "relative h-9 w-9 transition-all duration-200 shadow-sm",
        finalStatus.className
      )}
    >
      {finalStatus.icon}
      {hasNotes && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background shadow-sm">
          {notesCount}
        </span>
      )}
    </Button>
  );

  // If no notes, just render the status button (non-clickable for popover)
  if (!hasNotes) {
    return <div title={finalStatus.label}>{StatusIcon}</div>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{StatusIcon}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/40 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <ScrollText className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h4 className="text-sm font-semibold leading-none tracking-tight">
              Admin Notes
            </h4>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Details regarding <span className="font-medium text-foreground">{finalStatus.label}</span> status
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
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

        {/* Footer */}
        <div className="bg-muted/40 p-2 border-t border-border text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            {notesCount} {notesCount === 1 ? "Note" : "Notes"} Found
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}