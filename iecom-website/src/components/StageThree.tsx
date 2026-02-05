"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
    UploadCloud, FileText, CheckCircle2, 
    File as FileIcon, Loader2, X, ExternalLink, 
    RefreshCw, AlertCircle, Check, Image as ImageIcon, Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getNiceStageThreeUploadUrl, saveNiceStageThreeKey, NiceStageThreeType } from "@/actions/server/competition/nice";
import { format } from "date-fns";

export function StageThreeSection({ 
    teamId,
    commitmentLink,
    commitmentAt,
    bannerLink,
    bannerAt,
    pptLink,
    pptAt,
    viewCommitmentUrl,
    viewBannerUrl,
    viewPptUrl
}: { 
    teamId: string,
    commitmentLink?: string | null,
    commitmentAt?: Date | null,
    bannerLink?: string | null,
    bannerAt?: Date | null,
    pptLink?: string | null,
    pptAt?: Date | null,
    viewCommitmentUrl?: string | null,
    viewBannerUrl?: string | null,
    viewPptUrl?: string | null
}) {
    return (
        <Card className="border-l-4 border-l-rose-500 shadow-sm mt-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-rose-500 hover:bg-rose-600">FINAL STAGE</Badge>
                            <span className="text-sm font-medium text-muted-foreground">Exhibition Preparation</span>
                        </div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            Final Deliverables
                        </CardTitle>
                        <CardDescription>
                            Upload your Commitment Letter, Banner, and Pitch Deck.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
                <NiceStageThreeItem 
                    teamId={teamId}
                    title="Commitment Letter"
                    description="Upload the signed commitment letter."
                    type="commitment"
                    accept=".pdf"
                    currentValue={commitmentLink}
                    uploadedAt={commitmentAt}
                    viewUrl={viewCommitmentUrl}
                    icon={<FileText className="w-5 h-5" />}
                />
                <NiceStageThreeItem 
                    teamId={teamId}
                    title="Exhibition Banner"
                    description="High-resolution banner."
                    type="banner"
                    accept=".jpg,.jpeg,.png,.pdf"
                    currentValue={bannerLink}
                    uploadedAt={bannerAt}
                    viewUrl={viewBannerUrl}
                    icon={<ImageIcon className="w-5 h-5" />}
                />
                <NiceStageThreeItem 
                    teamId={teamId}
                    title="Presentation Deck (PPT)"
                    description="Final presentation slides."
                    type="ppt"
                    accept=".pdf,.ppt,.pptx"
                    currentValue={pptLink}
                    uploadedAt={pptAt}
                    viewUrl={viewPptUrl}
                    icon={<Presentation className="w-5 h-5" />}
                />
            </CardContent>
        </Card>
    );
}

function NiceStageThreeItem({
    teamId, title, description, type, accept, currentValue, uploadedAt, viewUrl, icon
}: {
    teamId: string;
    title: string;
    description: string;
    type: NiceStageThreeType;
    accept: string;
    currentValue?: string | null;
    uploadedAt?: Date | null;
    viewUrl?: string | null;
    icon: React.ReactNode;
}) {
    const router = useRouter();
    const [submission, setSubmission] = useState({ key: currentValue, url: viewUrl });
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const hasSubmission = !!submission.key;

    useEffect(() => {
        setSubmission({ key: currentValue, url: viewUrl });
    }, [currentValue, viewUrl]);

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        const toastId = toast.loading("Uploading...");

        try {
            const { signedUrl, key } = await getNiceStageThreeUploadUrl(teamId, type, selectedFile.name, selectedFile.type);
            
            const res = await fetch(signedUrl, {
                method: "PUT",
                body: selectedFile,
                headers: { "Content-Type": selectedFile.type },
            });

            if (!res.ok) throw new Error("Upload failed");

            await saveNiceStageThreeKey(teamId, type, key);

            setSubmission({ key, url: URL.createObjectURL(selectedFile) });
            setUploadSuccess(true);
            toast.success("Uploaded successfully!", { id: toastId });
            setIsEditing(false);
            setSelectedFile(null);
            router.refresh();
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const getFileName = (key?: string | null) => key ? key.split('/').pop() : "File";

    return (
        <Card className={cn(
            "border transition-all duration-300 overflow-hidden",
            hasSubmission && !isEditing 
                ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/50" 
                : "bg-card border-border",
            uploadSuccess && "ring-2 ring-rose-500/50"
        )}>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 flex items-start gap-4 w-full">
                    <div className={cn("p-2.5 rounded-lg border", hasSubmission ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-muted text-muted-foreground")}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{title}</h4>
                            {hasSubmission && <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200 text-[10px] h-5 px-1.5"><CheckCircle2 className="w-3 h-3 mr-1"/> Submitted</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                        {uploadedAt && hasSubmission && !isEditing && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Uploaded: {format(new Date(uploadedAt), "PP p")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-[320px] shrink-0">
                    {(!hasSubmission || isEditing) ? (
                        <div className={cn("space-y-2", isEditing && "bg-muted/30 p-3 rounded-lg border border-dashed")}>
                            {isEditing && (
                                <div className="flex justify-between items-center text-xs font-medium text-amber-600 mb-2">
                                    <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Replacing File</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsEditing(false)}><X className="w-3 h-3"/></Button>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept={accept} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                            
                            {!selectedFile ? (
                                <Button variant="outline" className="w-full border-dashed text-muted-foreground hover:text-rose-600 hover:border-rose-300" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    <UploadCloud className="w-4 h-4 mr-2"/> {isEditing ? "Select New File" : "Upload File"}
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm bg-background border rounded px-2 py-1.5">
                                        <FileIcon className="w-4 h-4 text-rose-500"/>
                                        <span className="truncate flex-1">{selectedFile.name}</span>
                                        <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4"/></button>
                                    </div>
                                    <Button onClick={handleFileUpload} disabled={isUploading} className="w-full bg-rose-600 hover:bg-rose-700">
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <span className="flex items-center gap-2"><Check className="w-4 h-4"/> Confirm</span>}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-background/60 border rounded-lg p-2.5 flex flex-col gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="w-4 h-4 text-rose-500 shrink-0"/>
                                <span className="text-xs font-medium truncate flex-1" title={submission.key || ""}>{getFileName(submission.key)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                                    <a href={submission.url || "#"} target="_blank"><ExternalLink className="w-3 h-3 mr-1.5"/> View</a>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}><RefreshCw className="w-3.5 h-3.5"/></Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}