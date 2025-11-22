"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Hourglass, XCircle, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";
import { uploadNiceTeamDocuments } from "@/actions/server/competition/nice";

// --- Helper: Status Badge ---
function SubmissionStatusBadge({ status }: { status: number | null }) {
  const config = {
    0: { 
        icon: <Hourglass className="h-4 w-4" />, 
        className: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" 
    },
    1: { 
        icon: <XCircle className="h-4 w-4" />, 
        className: "text-destructive bg-destructive/10 border-destructive/20" 
    },
    2: { 
        icon: <CheckCircle2 className="h-4 w-4" />, 
        className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
  }[status ?? 0] || { 
        icon: <Hourglass className="h-4 w-4" />, 
        className: "text-muted-foreground bg-muted border-border" 
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-8 w-8 p-0 cursor-default hover:bg-transparent shadow-sm", config.className)}
      title="Submission Status"
      disabled
    >
      {config.icon}
    </Button>
  );
}

// --- Component ---

export function DocumentsSection({
  bmcLink,
  pooLink,
  submissionStatus,
  step = "STEP 2",
  className,
}: {
  bmcLink: string | null;
  pooLink: string | null;
  submissionStatus: number;
  step?: string;
  className?: string;
}) {
  
  // Shadcn Dark Theme Compatible Classes
  const cardClass = "bg-card border-border text-card-foreground shadow-lg";

  // Exact Links Provided
  const POO_TEMPLATE_URL = "https://docs.google.com/document/d/1gwyCKHr-n9aRNb4JJUlwfrftdpMq18c3/edit?usp=sharing&ouid=106514700169643881045&rtpof=true&sd=true";
  const BMC_TEMPLATE_URL = "https://drive.google.com/file/d/1368HutytushOahUZZkSeDpkRhqKGtwLe/view?usp=sharing";

  return (
    <Card className={cn("border-l-4", cardClass, className)}> 
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
            {step}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">Required Documents</span>
        </div>
        <CardTitle className="text-foreground">Project Documents</CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload your Business Model Canvas and Proof of Originality.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Download Section - Styled for Dark Theme */}
        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-border border-dashed">
          <div className="flex items-center gap-2">
             <FileText className="h-4 w-4 text-muted-foreground" />
             <h4 className="font-medium text-sm text-foreground">Download Templates</h4>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* BMC Template Button */}
            <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/50 transition-all"
            >
                <a href={BMC_TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                   <Download className="mr-2 h-4 w-4" /> 
                   BMC Template
                </a>
            </Button>

            {/* POO Template Button */}
            <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/50 transition-all"
            >
                <a href={POO_TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                   <Download className="mr-2 h-4 w-4" /> 
                   POO Template
                </a>
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col gap-4">
          
          {/* 1. Business Model Canvas */}
          <FileUploaderField
            name="doc_bmc"  // Matches your original NICE logic
            label="Business Model Canvas (BMC)"
            accept=".pdf"
            currentFileUrl={bmcLink}
            verificationBadge={<SubmissionStatusBadge status={submissionStatus} />}
            uploadAction={uploadNiceTeamDocuments}
          />
          
          {/* 2. Proof of Originality */}
          <FileUploaderField
            name="doc_poo" // Matches your original NICE logic
            label="Proof of Originality (POO)"
            accept=".pdf"
            currentFileUrl={pooLink}
            verificationBadge={<SubmissionStatusBadge status={submissionStatus} />}
            uploadAction={uploadNiceTeamDocuments}
          />
        </div>
      </CardContent>
    </Card>
  );
}