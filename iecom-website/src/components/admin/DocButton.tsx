"use client";

import { useState } from "react";
import { Download, ExternalLink, Loader2, Paperclip, Clock } from "lucide-react";
import { toast } from "sonner";
import { getSignedDocUrl } from "@/actions/server/admin";

interface DocButtonProps {
  name : string;
  label: string;
  link?: string | null;
  isExternal?: boolean;
  date?: Date | string | null;
}

export const DocButton = ({ name, label, link, isExternal = false, date }: DocButtonProps) => {
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
    // 1. External Links: Usually cannot be auto-downloaded due to CORS, keep as open in new tab
    if (isExternal) {
      window.open(link, "_blank");
      return;
    }

    setLoading(true);
    try {
      // 2. Get the signed URL from your server action
      const res = await getSignedDocUrl(link);
      
      if (res?.success && res.url) {
        try {
          // --- AUTO DOWNLOAD LOGIC START ---
          
          // A. Fetch the file content
          const response = await fetch(res.url);
          if (!response.ok) throw new Error("Network response was not ok");
          
          // B. Convert to Blob (Binary Large Object)
          const blob = await response.blob();
          
          // C. Create a temporary URL for the Blob
          const downloadUrl = window.URL.createObjectURL(blob);
          
          // D. Create a hidden <a> element to trigger the download
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${name}_${label}`; // Uses the label as the filename (e.g., "Invoice.pdf")
          document.body.appendChild(a);
          a.click();
          
          // E. Cleanup
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
          toast.success("Download started");
          
          // --- AUTO DOWNLOAD LOGIC END ---

        } catch (downloadError) {
          // Fallback: If CORS blocks the fetch or blob fails, open in new tab
          console.error("Download failed, falling back to open", downloadError);
          window.open(res.url, "_blank");
        }
      } else {
        toast.error("Could not retrieve document");
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