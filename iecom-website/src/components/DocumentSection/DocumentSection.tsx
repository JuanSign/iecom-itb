"use client";

import React from "react";
import { uploadNiceTeamDocuments } from "@/actions/server/competition/nice"; // Updated import path
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Download, Hourglass, XCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUploaderField } from "../FileUploaderField/FileUploaderField";

// --- Verification Badge Component ---
function VerificationBadge({ status }: { status: number | null }) {
  const defaultStatus = {
    icon: <Hourglass className="h-4 w-4" />,
    className: "text-yellow-600 bg-yellow-50 border-yellow-300",
  };
  
  // Mapping: 0 = Pending, 1 = Rejected, 2 = Verified
  const statusConfig = ({
    0: defaultStatus,
    1: {
      icon: <XCircle className="h-4 w-4" />,
      className: "text-destructive bg-destructive/10 border-destructive/50",
    },
    2: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      className: "text-emerald-600 bg-emerald-50 border-emerald-400",
    },
  } as Record<number, typeof defaultStatus>)[status ?? 0] || defaultStatus;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("relative h-9 w-9 p-0 cursor-default", statusConfig.className)}
      aria-label={`Verification Status: ${status}`}
      disabled
    >
      {statusConfig.icon}
    </Button>
  );
}

// Update these URLs to your actual template locations
const BMC_TEMPLATE_URL = "/files/templates/nice-bmc-template.pdf";
const POO_TEMPLATE_URL = "/files/templates/nice-poo-template.pdf";

export function DocumentsSection({
  bmcLink,
  pooLink,
  submissionStatus,
  step = "STEP 2",
  className,
}: {
  bmcLink: string | null;
  pooLink: string | null;
  submissionStatus: number; // Using general submission status from TeamNICE
  step?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-l-4", className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-background">{step}</Badge>
            <span className="text-sm font-medium text-muted-foreground">Required Documents</span>
        </div>
        <CardTitle>Uploading Core Documents</CardTitle>
        <CardDescription>
          Download the templates, fill them out, and upload the PDF versions here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-6">
          {/* Download Section */}
          <div className="flex flex-col gap-2">
            <h4 className="font-medium text-sm text-muted-foreground">Download Templates</h4>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                  <a href={BMC_TEMPLATE_URL} download>
                  <Download className="mr-2 h-4 w-4" /> Business Model Canvas
                  </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                  <a href={POO_TEMPLATE_URL} download>
                  <Download className="mr-2 h-4 w-4" /> Proof of Originality
                  </a>
              </Button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col gap-4 border-t pt-4">
            <h4 className="font-medium">Upload Completed Documents</h4>
            
            <FileUploaderField
              name="doc_bmc"
              label="Business Model Canvas (BMC)"
              accept=".pdf"
              currentFileUrl={bmcLink}
              // Assuming submission_status applies to the whole batch, 
              // or pass 0 if you don't have per-file verification yet.
              verificationBadge={<VerificationBadge status={submissionStatus} />}
              uploadAction={uploadNiceTeamDocuments}
            />
            
            <FileUploaderField
              name="doc_poo"
              label="Proof of Originality (POO)"
              accept=".pdf"
              currentFileUrl={pooLink}
              verificationBadge={<VerificationBadge status={submissionStatus} />}
              uploadAction={uploadNiceTeamDocuments}
            />
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}