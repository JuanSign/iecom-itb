"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CustomFileInput, isImageUrl } from "../CustomFileInput/CustomFileInput";

import { updateMemberDetails as updateNice } from "@/actions/server/competition/nice"; 
import { updateMemberDetails as updateIecom } from "@/actions/server/competition/iecom";

export type Member = {
  account_id: string;
  email: string;
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  id_no: string | null;
  sc_link: string | null;
  sc_verified: number;
  sd_link: string | null;
  sd_verified: number;
  fp_link: string | null;
  fp_verified: number;
  status: number;
  notes: string[] | null;
};

export type UpdateMemberFormState = {
  error?: string;
  message?: string;
};

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="text-white">
      {pending ? "Saving..." : "Save Details"}
    </Button>
  );
}

function ViewMemberDetails({ member }: { member: Member }) {
  const renderFile = (url: string | null, label: string) => {
    if (!url) {
      return <p className="text-sm text-muted-foreground">Not provided</p>;
    }

    if (isImageUrl(url)) {
      return (
        <Image
          src={url}
          alt={label}
          width={128}
          height={128}
          className="h-32 w-32 rounded-md object-cover border mt-2"
        />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Student Card (SC)</FieldLabel>
              <VerificationStatusBadge status={member.sc_verified} />
            </div>
            {renderFile(member.sc_link, "Student Card")}
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Student Data (SD)</FieldLabel>
              <VerificationStatusBadge status={member.sd_verified} />
            </div>
            {renderFile(member.sd_link, "Student Data")}
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Formal Photo (FP)</FieldLabel>
              <VerificationStatusBadge status={member.fp_verified} />
            </div>
            {renderFile(member.fp_link, "Formal Photo")}
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

// --- Main Dialog Component ---

const initialState: UpdateMemberFormState = {};

export function TeamMemberDialog({
  member,
  isCurrentUser,
  event, // Added Prop
}: {
  member: Member;
  isCurrentUser: boolean;
  event: "NICE" | "IECOM"; // Added Type
}) {
  const [open, setOpen] = useState(false);

  // --- 2. Dynamically Select Action ---
  // Based on the event prop, we choose which server action to run.
  const selectedAction = event === "NICE" ? updateNice : updateIecom;

  const [formState, formAction] = useActionState(selectedAction, initialState);

  // --- 3. Fixed useEffect ---
  useEffect(() => {
    if (formState?.error) {
      toast.error(formState.error);
    } 
    
    if (formState?.message) {
      toast.success(formState.message);
      
      // Fix: Wrap setOpen in setTimeout to avoid synchronous state update error.
      // This pushes the modal closing to the end of the event loop.
      const timer = setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [formState]); 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          {isCurrentUser ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCurrentUser
              ? "Edit Your Details"
              : `View ${member.name || member.email}`}
          </DialogTitle>
          <DialogDescription>
            {isCurrentUser
              ? "Update your personal information and upload required documents."
              : "You are viewing this member's details."}
          </DialogDescription>
        </DialogHeader>

        {isCurrentUser ? (
          <form action={formAction}>
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
                      <FieldLabel htmlFor="id_no">ID Number (NIM/KTP)</FieldLabel>
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
                <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">Documents</h4>
                
                {/* Student Card */}
                <Field>
                  <div className="flex justify-between items-center mb-1">
                    <FieldLabel>Student Card (SC)</FieldLabel>
                    <VerificationStatusBadge status={member.sc_verified} />
                  </div>
                  <CustomFileInput
                    name="sc_link"
                    label="Student Card"
                    accept=".pdf,.jpg,.jpeg,.png"
                    currentFileUrl={member.sc_link}
                    disabled={!isCurrentUser}
                  />
                </Field>

                {/* Student Data / Declaration */}
                <Field>
                  <div className="flex justify-between items-center mb-1">
                    <FieldLabel>Student Data (SD)</FieldLabel>
                    <VerificationStatusBadge status={member.sd_verified} />
                  </div>
                  <CustomFileInput
                    name="sd_link"
                    label="Student Data Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    currentFileUrl={member.sd_link}
                    disabled={!isCurrentUser}
                  />
                </Field>

                {/* Formal Photo */}
                <Field>
                  <div className="flex justify-between items-center mb-1">
                    <FieldLabel>Formal Photo (FP)</FieldLabel>
                    <VerificationStatusBadge status={member.fp_verified} />
                  </div>
                  <CustomFileInput
                    name="fp_link"
                    label="Formal Photo"
                    accept=".jpg,.jpeg,.png"
                    currentFileUrl={member.fp_link}
                    disabled={!isCurrentUser}
                  />
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        ) : (
          <>
            <ViewMemberDetails member={member} />
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}