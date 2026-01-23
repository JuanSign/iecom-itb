"use client";

import { useState } from "react";
import { Download, ExternalLink, Loader2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { getSignedDocUrl } from "@/actions/server/admin";

interface DocButtonProps {
  label: string;
  link?: string | null;
  isExternal?: boolean;
}

export const DocButton = ({ label, link, isExternal = false }: DocButtonProps) => {
  const [loading, setLoading] = useState(false);

  // If no link exists, render a disabled placeholder
  if (!link) {
    return (
      <div className="flex items-center justify-between p-2 rounded border border-dashed border-zinc-800 text-xs text-zinc-600">
        <span className="flex items-center gap-2"><Paperclip className="h-3 w-3" /> {label}</span>
        <span className="italic">Missing</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isExternal) {
      window.open(link, "_blank");
      return;
    }

    setLoading(true);
    const res = await getSignedDocUrl(link);
    setLoading(false);

    if (res?.success && res.url) {
      window.open(res.url, "_blank");
    } else {
      toast.error("Could not open document");
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800 hover:border-blue-500/50 group transition-all w-full text-left"
    >
      <span className="text-xs text-zinc-300 flex items-center gap-2">
        {isExternal ? <ExternalLink className="h-3 w-3 text-zinc-500" /> : <Paperclip className="h-3 w-3 text-zinc-500" />}
        {label}
      </span>
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
      ) : (
        <Download className="h-3 w-3 text-zinc-500 group-hover:text-blue-400" />
      )}
    </button>
  );
};