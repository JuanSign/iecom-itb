"use client";

import React, { useState, useId, useActionState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { 
  UploadCloud, 
  Save, 
  X, 
  FileText, 
  ExternalLink, 
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

// --- Types ---
export type FormState = {
  error?: string;
  message?: string;
};

// --- Helper ---
export function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".png");
  } catch {
    return false;
  }
}

// --- Sub-Component: Action Buttons ---
function ActionButtons({ 
  onCancel, 
}: { 
  onCancel: () => void; 
  id: string;
}) {
  const { pending } = useFormStatus();
  
  return (
    // Flex-col for mobile, sm:flex-row for desktop
    <div className="flex flex-col sm:flex-row gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium order-1"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Confirm Upload
          </>
        )}
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={onCancel}
        className="w-full sm:w-auto text-muted-foreground hover:text-destructive order-2"
      >
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
}

// --- Main Component ---
export function FileUploaderField({
  name,
  label,
  accept,
  currentFileUrl,
  verificationBadge,
  uploadAction,
  disabled = false,
}: {
  name: string;
  label: string;
  accept: string;
  currentFileUrl: string | null;
  verificationBadge: React.ReactNode;
  uploadAction: (prevState: FormState, formData: FormData) => Promise<FormState>;
  disabled?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const id = useId();
  const isImage = isImageUrl(currentFileUrl);
  
  const [formState, formAction] = useActionState(uploadAction, {});

  const resetSelection = useCallback(() => {
    setFile(null);
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, [id]);

  // 2. useEffect with setTimeout fix
  useEffect(() => {
    if (formState?.error) {
      toast.error(formState.error);
    }
    if (formState?.message) {
      toast.success(formState.message);
      
      // FIX: Wrap in setTimeout to avoid "synchronous setState in effect" error
      const timer = setTimeout(() => {
        resetSelection();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [formState, resetSelection]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
    }
  };

  // Logic to determine view state
  const showCurrentFileCard = currentFileUrl && !file;
  const showDraftCard = !!file;
  const showDropzone = !showCurrentFileCard && !showDraftCard;

  return (
    <Field className="w-full">
      <div className="flex justify-between items-center mb-2">
        <FieldLabel htmlFor={disabled ? undefined : id} className="font-semibold text-foreground">
            {label}
        </FieldLabel>
        {verificationBadge}
      </div>

      {/* FORM WRAPPER */}
      <form action={formAction} className="w-full">
        
        {/* 1. HIDDEN INPUT (Always present) */}
        {!disabled && (
            <Input
                id={id}
                name={name}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={handleFileChange}
            />
        )}

        {/* 2. VIEW: CURRENT FILE CARD */}
        {showCurrentFileCard && (
          <div className="relative group overflow-hidden rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex items-center gap-4 p-3">
              {/* Thumbnail */}
              <div className="shrink-0 relative h-12 w-12 rounded-md overflow-hidden bg-background border border-border flex items-center justify-center">
                {isImage ? (
                  <Image
                    src={currentFileUrl!}
                    alt={label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FileText className="h-6 w-6 text-primary" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate pr-4 text-foreground">
                  {isImage ? "Image Uploaded" : "Document Uploaded"}
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

              {/* Replace Button */}
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

        {/* 3. VIEW: DRAFT / READY TO UPLOAD CARD */}
        {showDraftCard && (
            <div className="rounded-lg border-2 border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <UploadCloud className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {file?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {(file!.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                        </p>
                    </div>
                </div>
                
                {/* Action Buttons for Draft */}
                <ActionButtons onCancel={resetSelection} id={id} />
            </div>
        )}

        {/* 4. VIEW: DROPZONE (Empty State) */}
        {showDropzone && !disabled && (
             <label
                htmlFor={id}
                className="relative flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-8 transition-all hover:bg-muted/30 hover:border-primary/50"
             >
               <div className="rounded-full bg-background p-2 shadow-sm border border-border">
                   <UploadCloud className="h-5 w-5 text-muted-foreground" />
               </div>
               <div className="text-center">
                   <p className="text-sm font-medium text-foreground">
                       Click to upload
                   </p>
                   <p className="text-xs text-muted-foreground mt-1">
                       {accept.replace(/,/g, ", ").toUpperCase()}
                   </p>
               </div>
             </label>
        )}

      </form>
    </Field>
  );
}