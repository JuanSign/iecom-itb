"use client";

import { useState } from "react";
import { Download, ExternalLink, Loader2, Paperclip, Clock } from "lucide-react";
import { toast } from "sonner";
import { getSignedDocUrl } from "@/actions/server/admin";

interface DocButtonProps {
  label: string;
  link?: string | null;
  isExternal?: boolean;
  date?: Date | string | null; // Added date prop
}

export const DocButton = ({ label, link, isExternal = false, date }: DocButtonProps) => {
  const [loading, setLoading] = useState(false);

  // Format date helper (Jakarta Time)
  const formattedDate = date ? new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  }) : null;

  // If no link exists, render a disabled placeholder
  if (!link) {
    return (
      <div className="flex items-center justify-between p-2 rounded border border-dashed border-zinc-800 text-xs text-zinc-600">
        <span className="flex items-center gap-2"><Paperclip className="h-3 w-3" /> {label}</span>
        <span className="italic text-[10px]">Missing</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isExternal) {
      window.open(link, "_blank");
      return;
    }

    setLoading(true);
    try {
      const res = await getSignedDocUrl(link);
      
      if (res?.success && res.url) {
        window.open(res.url, "_blank");
      } else {
        toast.error("Could not open document");
      }
    } catch {
      toast.error("Error accessing file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-blue-500/50 group transition-all w-full text-left"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-zinc-300 flex items-center gap-2 font-medium">
          {isExternal ? <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0" /> : <Paperclip className="h-3 w-3 text-zinc-500 shrink-0" />}
          {label}
        </span>
        
        {/* Render Date if available */}
        {formattedDate && (
          <span className="text-[10px] text-zinc-500 flex items-center gap-1 pl-5">
            <Clock className="h-2.5 w-2.5" /> 
            {formattedDate} WIB
          </span>
        )}
      </div>

      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
      ) : (
        <Download className="h-3 w-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
      )}
    </button>
  );
};