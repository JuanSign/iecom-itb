"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Pencil,
  Hourglass,
  XCircle,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CustomFileInput, isImageUrl } from "../CustomFileInput/CustomFileInput";

// --- Actions ---
import { updateMemberDetails as updateNice } from "@/actions/server/competition/nice";
import { updateMemberDetails as updateIecom } from "@/actions/server/competition/iecom";
import { uploadSingleFile } from "@/actions/server/upload";
import { Member, UpdateMemberFormState } from "@/actions/types/Competition";

// --- Helper Components ---

function VerificationStatusBadge({ status }: { status: number }) {
  const statusConfig = {
    0: {
      text: "Waiting",
      icon: <Hourglass className="h-3 w-3" />,
      className:
        "text-yellow-600 border-yellow-300 bg-yellow-50 hover:bg-yellow-50",
    },
    1: {
      text: "Rejected",
      icon: <XCircle className="h-3 w-3" />,
      className:
        "text-destructive border-destructive/50 bg-destructive/10 hover:bg-destructive/10",
    },
    2: {
      text: "Accepted",
      icon: <CheckCircle2 className="h-3 w-3" />,
      className:
        "text-emerald-600 border-emerald-400 bg-emerald-50 hover:bg-emerald-50",
    },
  }[status];

  if (!statusConfig) return <VerificationStatusBadge status={0} />;

  return (
    <Badge
      variant="outline"
      className={`shrink-0 gap-1.5 ${statusConfig.className}`}
    >
      {statusConfig.icon}
      <span className="hidden sm:inline">{statusConfig.text}</span>
    </Badge>
  );
}

function ViewMemberDetails({ member }: { member: Member }) {
  const renderFile = (url: string | null, label: string) => {
    if (!url) {
      return <p className="text-sm text-muted-foreground">Not provided</p>;
    }

    if (isImageUrl(url)) {
      return (
        <Link href={url} target="_blank" rel="noopener noreferrer">
          <Image
            src={url}
            alt={label}
            width={128}
            height={128}
            className="h-32 w-32 rounded-md object-cover border mt-2 hover:opacity-90 transition-opacity"
          />
        </Link>
      );
    }

    return (
      <Button asChild variant="link" className="p-0 h-auto mt-1">
        <Link href={url} target="_blank" rel="noopener noreferrer">
          View {label}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Full Name</FieldLabel>
          <p className="text-sm pt-1 font-medium">
            {member.name || <span className="text-muted-foreground">N/A</span>}
          </p>
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <p className="text-sm pt-1">{member.email}</p>
        </Field>
        <Field>
          <FieldLabel>Institution</FieldLabel>
          <p className="text-sm pt-1">
            {member.institution || <span className="text-muted-foreground">N/A</span>}
          </p>
        </Field>
        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <p className="text-sm pt-1">
            {member.phone_num || <span className="text-muted-foreground">N/A</span>}
          </p>
        </Field>
        <Field>
          <FieldLabel>ID Number</FieldLabel>
          <p className="text-sm pt-1">
            {member.id_no || <span className="text-muted-foreground">N/A</span>}
          </p>
        </Field>
      </div>

      <div className="border-t my-2" />

      {/* Documents Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Documents</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Student Card (SC)</FieldLabel>
              <VerificationStatusBadge status={member.sc_verified} />
            </div>
            {renderFile(member.sc_link, "Student Card")}
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>PDDIKTI Data (SD)</FieldLabel>
              <VerificationStatusBadge status={member.sd_verified} />
            </div>
            {renderFile(member.sd_link, "PDDIKTI Data")}
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Proof of Following (FP)</FieldLabel>
              <VerificationStatusBadge status={member.fp_verified} />
            </div>
            {renderFile(member.fp_link, "Follow Proof")}
          </Field>

          {/* NEW: Share Proof */}
          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Proof of Sharing (SP)</FieldLabel>
              <VerificationStatusBadge status={member.sp_verified} />
            </div>
            {renderFile(member.sp_link, "Share Proof")}
          </Field>
        </div>
      </div>

      {/* Notes Section */}
      {member.notes && member.notes.length > 0 && (
        <>
          <div className="border-t my-2" />
          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">Admin Notes</h4>
            </div>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {member.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

const initialState: UpdateMemberFormState = {};

// --- Main Component ---

export function TeamMemberDialog({
  member,
  isCurrentUser,
  event,
}: {
  member: Member;
  isCurrentUser: boolean;
  event: "NICE" | "IECOM";
}) {
  const [open, setOpen] = useState(false);
  
  // State to track the Client-Side Upload phase
  const [isUploading, setIsUploading] = useState(false);
  
  // State to track the Server Action phase
  const [pending, startTransition] = useTransition();

  const selectedAction = event === "NICE" ? updateNice : updateIecom;
  const [state, dispatch] = useActionState(selectedAction, initialState);

  // Handle Server Action Response
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.message) {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  // --- The "Sequential Upload" Handler ---
  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stop default browser submission
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const finalPayload = new FormData();

    // 1. Copy basic text fields to final payload
    const textFields = ["name", "institution", "phone_num", "id_no"];
    textFields.forEach((field) => {
      finalPayload.append(field, formData.get(field) as string);
    });

    // 2. Define file configuration
    const filesToProcess = [
      { inputName: "sc_link", folder: "member-sc", keyName: "sc_key", label: "Student Card" },
      { inputName: "sd_link", folder: "member-sd", keyName: "sd_key", label: "PDDIKTI" },
      { inputName: "fp_link", folder: "member-fp", keyName: "fp_key", label: "Follow Proof" },
      { inputName: "sp_link", folder: "member-sp", keyName: "sp_key", label: "Share Proof" }, // NEW
    ];

    try {
      // 3. Loop through files, upload one by one, and append KEYS to payload
      for (const item of filesToProcess) {
        const file = formData.get(item.inputName) as File;

        // Only upload if the user selected a new file
        if (file && file.size > 0) {
          // Strict Client-side Size Check (1MB)
          if (file.size > 1024 * 1024) {
            throw new Error(`${item.label} is too large (Max 1MB).`);
          }

          const uploadFormData = new FormData();
          uploadFormData.append("file", file);

          // Call the Helper Action
          const result = await uploadSingleFile(uploadFormData, item.folder);

          if (!result.success || !result.key) {
            throw new Error(`Failed to upload ${item.label}.`);
          }

          // Append the R2 KEY (string) to the final payload
          finalPayload.append(item.keyName, result.key);
        }
      }

      // 4. Submit everything to the Main Server Action
      startTransition(() => {
        dispatch(finalPayload);
      });

    } catch (error) {
      if(error instanceof Error)
        toast.error(error.message || "An unexpected error occurred.");
      else toast.error("ERROR!")
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || pending;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Toaster richColors/>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          {isCurrentUser ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        
        {/* Header */}
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>
              {isCurrentUser
                ? "Edit Your Details"
                : `View ${member.name || member.email}`}
            </DialogTitle>
            <DialogDescription>
              {isCurrentUser
                ? "Max file size: 1MB per document."
                : "You are viewing this member's details."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isCurrentUser ? (
            <form id="update-member-form" onSubmit={handleCustomSubmit} className="h-full">
              <FieldGroup className="flex flex-col gap-6">
                {/* --- Personal Details --- */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={member.name ?? ""}
                        placeholder="e.g. John Doe"
                        className="mt-1"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="institution">Institution</FieldLabel>
                      <Input
                        id="institution"
                        name="institution"
                        defaultValue={member.institution ?? ""}
                        placeholder="University name"
                        className="mt-1"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone_num">Phone Number</FieldLabel>
                      <Input
                        id="phone_num"
                        name="phone_num"
                        defaultValue={member.phone_num ?? ""}
                        placeholder="+62..."
                        className="mt-1"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="id_no">Student Number (NIM)</FieldLabel>
                      <Input
                        id="id_no"
                        name="id_no"
                        defaultValue={member.id_no ?? ""}
                        placeholder="e.g. 12345678"
                        className="mt-1"
                      />
                    </Field>
                  </div>
                </div>

                {/* --- Documents --- */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Documents (Max 1MB each)</h4>
                  
                  {/* Student Card */}
                  <Field>
                    <div className="flex justify-between items-center mb-1">
                      <FieldLabel>Student Card</FieldLabel>
                      <VerificationStatusBadge status={member.sc_verified} />
                    </div>
                    <CustomFileInput
                      name="sc_link"
                      label="Upload Student Card"
                      accept=".pdf,.jpg,.jpeg,.png"
                      currentFileUrl={member.sc_link}
                      disabled={!isCurrentUser}
                    />
                  </Field>

                  {/* PDDIKTI */}
                  <Field>
                    <div className="flex justify-between items-center mb-1">
                      <FieldLabel>PDDIKTI Screenshot</FieldLabel>
                      <VerificationStatusBadge status={member.sd_verified} />
                    </div>
                    <CustomFileInput
                      name="sd_link"
                      label="Upload PDDIKTI Screenshot"
                      accept=".pdf,.jpg,.jpeg,.png"
                      currentFileUrl={member.sd_link}
                      disabled={!isCurrentUser}
                    />
                  </Field>

                  <Field>
                    <div className="flex justify-between items-center mb-1">
                      <FieldLabel>Proof of Following @iecom2026</FieldLabel>
                      <VerificationStatusBadge status={member.fp_verified} />
                    </div>
                    <CustomFileInput
                      name="fp_link"
                      label="Upload Follow Screenshot"
                      accept=".jpg,.jpeg,.png"
                      currentFileUrl={member.fp_link}
                      disabled={!isCurrentUser}
                    />
                  </Field>

                  <Field>
                    <div className="flex justify-between items-center mb-1">
                      <FieldLabel>Proof of Sharing @iecom2026</FieldLabel>
                      <VerificationStatusBadge status={member.sp_verified ?? 0} />
                    </div>
                    <CustomFileInput
                      name="sp_link"
                      label="Upload Share Screenshot"
                      accept=".jpg,.jpeg,.png"
                      currentFileUrl={member.sp_link}
                      disabled={!isCurrentUser}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </form>
          ) : (
            <ViewMemberDetails member={member} />
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 pt-4 border-t bg-background mt-auto">
          {isCurrentUser ? (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                form="update-member-form"
                disabled={isLoading} 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? "Uploading Files..." : "Saving Details..."}
                  </>
                ) : (
                  "Save Details"
                )}
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}