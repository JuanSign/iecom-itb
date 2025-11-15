"use client";

import React, { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function isImageUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".jpg") || path.endsWith(".jpeg") || path.endsWith(".png");
  } catch (e) {
    console.log(e);
    return false;
  }
}

export function CustomFileInput({
  name,
  label,
  accept,
  currentFileUrl,
  disabled = false,
}: {
  name: string;
  label: string;
  accept: string;
  currentFileUrl: string | null;
  disabled?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const id = useId();

  return (
    <Field>
      <div>
        <FieldLabel htmlFor={disabled ? undefined : id}>{label}</FieldLabel>
        
        <div className="mt-1 flex flex-col gap-2"> 
          
          {/* Show Image or Link */}
          {currentFileUrl && (
            isImageUrl(currentFileUrl) ? (
              <div className="my-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Current File:</p>
                <Image
                  src={currentFileUrl}
                  alt={label}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-md object-cover"
                />
              </div>
            ) : (
              <Link
                href={currentFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 underline"
              >
                View Current File (PDF)
              </Link>
            )
          )}

          {!disabled && (
            <> 
              <label
                htmlFor={id}
                className="relative flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted bg-background px-4 py-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <UploadCloud className="h-6 w-6" />
                <span>{file ? file.name : (currentFileUrl ? "Upload to replace" : "Click or drag to upload")}</span>
                <Input
                  id={id}
                  name={name}
                  type="file"
                  accept={accept}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setFile(null);
                    const fileInput = document.getElementById(id) as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Clear selection
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Field>
  );
}