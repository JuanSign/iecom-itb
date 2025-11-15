"use client";

import React, { useState, useId, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UploadCloud, Save, Eraser } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

// 1. Generic FormState used across your app
export type FormState = {
  error?: string;
  message?: string;
};

// Helper: Check if URL is image
export function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".png");
  } catch {
    return false;
  }
}

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
  
  // 2. Use the generic action
  const [formState, formAction] = useActionState(uploadAction, {});

  useEffect(() => {
    if (formState?.error) {
      toast.error(formState.error);
    }
    if (formState?.message) {
      toast.success(formState.message);
      setFile(null); // Clear selection on success
      
      // Reset file input value
      const fileInput = document.getElementById(id) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  }, [formState, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };
  
  const displayFileName = file 
    ? file.name 
    : (currentFileUrl ? "Upload to replace" : "Click or drag to upload");

  // 3. Sub-component defined inside to access state
  function ActionButtons() {
    const { pending } = useFormStatus();
    return (
      <div className="flex justify-end gap-2 mt-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="text-white bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          {pending ? "Uploading..." : "Save & Upload"}
        </Button>
        
        <Button
          type="button" // Changed to button to prevent form submission
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            setFile(null);
            const fileInput = document.getElementById(id) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
          }}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Discard
        </Button>
      </div>
    );
  }

  return (
    <Field>
      <div className="flex justify-between items-center mb-1">
        <FieldLabel htmlFor={disabled ? undefined : id}>{label}</FieldLabel>
        {verificationBadge}
      </div>

      {/* Current File Preview */}
      {currentFileUrl && !file && (
        <div className="mb-2">
          <p className="text-sm font-medium text-muted-foreground mb-2">Current File:</p>
          {isImageUrl(currentFileUrl) ? (
            <Image
              src={currentFileUrl}
              alt={label}
              width={128}
              height={128}
              className="h-32 w-32 rounded-md object-cover border"
            />
          ) : (
            <Button asChild variant="link" className="p-0 h-auto">
                <Link href={currentFileUrl} target="_blank" rel="noopener noreferrer">
                View Current File (PDF)
                </Link>
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!disabled && (
        <form action={formAction}>
          <label
            htmlFor={id}
            className="relative flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted bg-background px-4 py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            <UploadCloud className="h-6 w-6" />
            <span className="text-sm text-center">{file ? file.name : displayFileName}</span>
            <Input
              id={id}
              name={name}
              type="file"
              accept={accept}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileChange}
            />
          </label>
          
          {file && <ActionButtons />} 
        </form>
      )}
    </Field>
  );
}