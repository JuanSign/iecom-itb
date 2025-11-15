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
} from "lucide-react";

type StatusConfig = {
  icon: React.ReactNode;
  className: string;
};

const statusMap: Record<number, StatusConfig> = {
  0: {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-600 bg-yellow-50 border-yellow-300 hover:bg-yellow-100",
  },
  1: {
    icon: <XCircle className="h-4 w-4" />,
    className: "text-destructive bg-destructive/10 border-destructive/50 hover:bg-destructive/20",
  },
  2: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "text-emerald-600 bg-emerald-50 border-emerald-400 hover:bg-emerald-100",
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
  const notesCount = notes?.length ?? 0;
  const hasNotes = notesCount > 0;

  let notesToDisplay: string[] = notes || [];
  const defaultNote = "Please contact admin for more information.";
  
  if (notesToDisplay.length === 0) {
      notesToDisplay = [defaultNote];
  }

  const StatusIcon = (
    <Button
      variant="outline"
      size="icon"
      className={`relative h-9 w-9 p-0 ${finalStatus.className}`}
    >
      {finalStatus.icon}
      {hasNotes && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold ring-2 ring-background">
          {notesCount}
        </span>
      )}
    </Button>
  );

  if (!hasNotes) {
    return StatusIcon;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {StatusIcon}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium leading-none">Admin Notes ({notesCount})</h4>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {notesToDisplay.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}