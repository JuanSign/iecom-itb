"use client";

import React, { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { 
  UploadCloud, 
  X, 
  FileText, 
  ExternalLink, 
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils"; 

export function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".png");
  } catch {
    return false;
  }
}

export function CustomFileInput({
  name,
  label,
  accept,
  currentFileUrl,
  disabled = false,
  statusBadge,
}: {
  name: string;
  label: string;
  accept: string;
  currentFileUrl: string | null;
  disabled?: boolean;
  statusBadge?: React.ReactNode;
}) {
  const [file, setFile] = useState<File | null>(null);
  const id = useId();
  const isImage = isImageUrl(currentFileUrl);

  const showCard = currentFileUrl && !file;

  return (
    <Field className="w-full">
      <div className="flex justify-between items-center mb-2">
        <FieldLabel htmlFor={disabled ? undefined : id} className="font-semibold">
            {label}
        </FieldLabel>
        {statusBadge}
      </div>
      
      <div className="flex flex-col gap-3"> 
        
        {!disabled && (
           <Input
             id={id}
             name={name}
             type="file"
             accept={accept}
             className="sr-only"
             onChange={(e) => setFile(e.target.files?.[0] ?? null)}
           />
        )}

        {showCard && (
          <div className="relative group overflow-hidden rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4 p-3">
              {/* Thumbnail */}
              <div className="shrink-0 relative h-12 w-12 rounded-md overflow-hidden bg-background border flex items-center justify-center">
                {isImage ? (
                  <Image
                    src={currentFileUrl!}
                    alt={label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FileText className="h-6 w-6 text-blue-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate pr-4">
                  {isImage ? "Image File" : "Document File"}
                </p>
                <Link
                  href={currentFileUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 w-fit"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Original
                </Link>
              </div>

              {!disabled && (
                 <label 
                    htmlFor={id} 
                    className="cursor-pointer p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground shadow-sm border border-transparent hover:border-border"
                    title="Replace file"
                 >
                    <RefreshCw className="h-4 w-4" />
                 </label>
              )}
            </div>
          </div>
        )}

        {(!showCard && !disabled) && (
          <div className="relative">
            <label
              htmlFor={id}
              className={cn(
                "relative flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-all",
                file 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-muted-foreground/25 bg-muted/20 hover:bg-muted/30 hover:border-primary/50"
              )}
            >
              <div className="rounded-full bg-background p-2 shadow-sm">
                  <UploadCloud className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                  <p className="text-sm font-medium">
                      {file ? file.name : "Click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                      {file ? "Ready to upload" : accept.replace(/,/g, ", ").toUpperCase()}
                  </p>
              </div>
            </label>

            {file && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault(); 
                  setFile(null);
                  const fileInput = document.getElementById(id) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}