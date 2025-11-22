"use client";

import React from "react";
import { updateBilling } from "@/actions/server/competition/iecom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Hourglass, XCircle, CheckCircle2, CreditCard, Copy, Building2 } from "lucide-react";
import { toast } from "sonner";
import { FileUploaderField } from "@/components/FileUploaderField/FileUploaderField";

// --- Configuration ---

const IECOM_PAYMENT_METHODS = [
  {
    bankName: "Bank Jago",
    accountNumber: "103027577943",
    accountHolder: "Aditia Muhammad Rafael",
  },
];

// --- Types ---

type PaymentProps = {
  paymentProofUrl: string | null;
  ppVerified: number;
  step?: string;
  className?: string;
};

// --- Helper Component ---

function VerificationBadge({ status }: { status: number | null }) {
  const config = {
    0: { icon: <Hourglass className="h-4 w-4" />, className: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
    1: { icon: <XCircle className="h-4 w-4" />, className: "text-destructive bg-destructive/10 border-destructive/20" },
    2: { icon: <CheckCircle2 className="h-4 w-4" />, className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  }[status ?? 0] || { icon: <Hourglass className="h-4 w-4" />, className: "text-muted-foreground" };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("h-8 w-8 p-0 cursor-default hover:bg-transparent shadow-sm", config.className)}
      disabled
    >
      {config.icon}
    </Button>
  );
}

// --- Main Component ---

export function PaymentSection({
  paymentProofUrl,
  ppVerified,
  step = "STEP 3",
  className,
}: PaymentProps) {
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Shadcn Dark Theme Compatible Card Classes
  const cardClass = "bg-card border-border text-card-foreground shadow-lg";

  return (
    <Card className={cn("border-l-4", cardClass, className)}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                {step}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">Payment Verification</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
                <CardTitle className="text-foreground">Payment</CardTitle>
                <CardDescription className="mt-1 text-muted-foreground">
                  Select a method below and transfer the EXACT amount.
                </CardDescription>
            </div>
            
            {/* SPLIT PRICE DISPLAY */}
            <div className="flex flex-col items-end bg-muted/30 p-3 rounded-lg border border-border/50">
                 <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Total Amount</span>
                 <span className="text-xl font-bold text-foreground tracking-tight">
                    IDR 249,000.00
                 </span>
                 <span className="text-xs font-medium text-muted-foreground">
                    or USD 15.00
                 </span>
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 gap-4">
            {IECOM_PAYMENT_METHODS.map((method, index) => (
                <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-xl border border-border bg-muted/20 p-5 transition-all hover:border-primary/30 hover:bg-muted/40"
                >
                    {/* Background Decorator */}
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <div className="relative space-y-4">
                        {/* Header: Bank Name */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border shadow-sm">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Transfer</span>
                                <span className="font-bold text-foreground">{method.bankName}</span>
                            </div>
                        </div>

                        {/* Body: Account Number */}
                        <div className="space-y-1.5">
                            <span className="text-xs text-muted-foreground">Account Number</span>
                            <div className="flex items-center gap-2">
                                <code className="text-xl font-mono font-semibold tracking-tight text-primary">
                                    {method.accountNumber}
                                </code>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background"
                                    onClick={() => copyToClipboard(method.accountNumber, method.bankName)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Footer: Account Holder */}
                        <div className="pt-2 border-t border-border border-dashed">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>{method.accountHolder}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                    Then Upload Proof
                </span>
            </div>
        </div>

        <FileUploaderField
          name="payment_proof_url"
          label="Payment Proof File"
          accept=".pdf,.jpg,.jpeg,.png"
          currentFileUrl={paymentProofUrl}
          verificationBadge={<VerificationBadge status={ppVerified} />}
          uploadAction={updateBilling}
        />
      </CardContent>
    </Card>
  );
}