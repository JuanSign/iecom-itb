"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    UploadCloud, FileText, Youtube, CheckCircle2, 
    Clock, File as FileIcon, Loader2, X, ExternalLink,
    Image as ImageIcon, RefreshCw, AlertCircle, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDeliverableUploadUrl, saveDeliverableKey, submitVideoLink } from "@/actions/server/competition/iecom/case-simulation";

type FileDeliverableType = "initial_draft" | "final_report" | "infographic";
type DeliverableType = FileDeliverableType | "video_link";

interface DeliverableItemProps {
    teamId: string;
    title: string;
    description: string;
    deadlineISO: string;
    type: DeliverableType;
    accept?: string; 
    currentValue?: string | null; 
    viewUrl?: string | null;      
}

export function DeliverableItem({
    teamId,
    title,
    description,
    deadlineISO,
    type,
    accept,
    currentValue,
    viewUrl
}: DeliverableItemProps) {
    const router = useRouter();

    // --- State Syncing ---
    const [submission, setSubmission] = useState<{ key?: string | null, url?: string | null }>({ 
        key: currentValue, 
        url: viewUrl 
    });

    // Sync state when props change (e.g. after router.refresh())
    useEffect(() => {
        setSubmission({ key: currentValue, url: viewUrl });
    }, [currentValue, viewUrl]);

    // --- Timer State ---
    const [timeLeft, setTimeLeft] = useState("");
    const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">("normal");
    const [isExpired, setIsExpired] = useState(false);
    
    // --- UI States ---
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false); 
    
    // --- Inputs ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [videoLink, setVideoLink] = useState("");

    const isLinkType = type === 'video_link';
    const hasSubmission = !!submission.key;

    // --- Countdown Logic ---
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const end = new Date(deadlineISO);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft("Deadline Passed");
                setUrgency("critical");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            if (days < 1) setUrgency("critical");
            else if (days < 3) setUrgency("warning");
            else setUrgency("normal");

            if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
            else setTimeLeft(`${hours}h ${minutes}m left`);
        };
        calculateTime();
        const timer = setInterval(calculateTime, 60000);
        return () => clearInterval(timer);
    }, [deadlineISO]);

    // --- Handlers ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File is too large. Max size is 50MB.");
            e.target.value = ""; 
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile && !isLinkType) return;
        
        setIsUploading(true);
        const toastId = toast.loading("Uploading...");

        try {
            const { signedUrl, key } = await getDeliverableUploadUrl(
                teamId, 
                type as FileDeliverableType, 
                selectedFile!.name,
                selectedFile!.type
            );

            const uploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: selectedFile,
                headers: { "Content-Type": selectedFile!.type },
            });

            if (!uploadResponse.ok) throw new Error("Upload failed");

            await saveDeliverableKey(teamId, type as FileDeliverableType, key);

            const optimisticUrl = URL.createObjectURL(selectedFile!);
            setSubmission({ key: key, url: optimisticUrl });
            setUploadSuccess(true);
            
            toast.success("Uploaded successfully!", { id: toastId });
            
            setIsEditing(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            router.refresh();
            setTimeout(() => setUploadSuccess(false), 3000);
            
        } catch (error) {
            console.error(error);
            toast.error("Upload failed.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleLinkSubmit = async () => {
        if (!videoLink) return;
        setIsUploading(true);
        try {
            await submitVideoLink(teamId, videoLink);
            setSubmission({ key: videoLink, url: videoLink });
            setIsEditing(false);
            setVideoLink("");
            setUploadSuccess(true);
            toast.success("Link saved!");
            router.refresh();
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch {
            toast.error("Failed to save link");
        } finally {
            setIsUploading(false);
        }
    };

    // FIX: Updated signature to accept undefined (key?)
    const getFileNameFromKey = (key?: string | null) => {
        if (!key) return "File";
        const parts = key.split('/');
        return parts[parts.length - 1];
    };

    const showUploadForm = !hasSubmission || isEditing;

    return (
        <Card className={cn(
            "border transition-all duration-300 overflow-hidden", 
            hasSubmission && !isEditing 
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/50" 
                : "bg-card border-border hover:border-muted-foreground/30",
            uploadSuccess && "ring-2 ring-emerald-500/50 ring-offset-1 dark:ring-offset-card"
        )}>
            <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-start justify-between">
                
                {/* --- LEFT: INFO SECTION --- */}
                <div className="flex-1 space-y-3 min-w-0 w-full">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-xl shrink-0 border transition-colors duration-300", 
                            hasSubmission 
                                ? "bg-emerald-100/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400" 
                                : "bg-muted border-border text-muted-foreground"
                        )}>
                            {isLinkType ? <Youtube className="w-5 h-5" /> : 
                             type === 'infographic' ? <ImageIcon className="w-5 h-5" /> : 
                             <FileText className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full min-w-0">
                            <div className="flex items-center gap-3 w-full flex-wrap">
                                <h4 className={cn("font-semibold text-base", hasSubmission ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}>
                                    {title}
                                </h4>
                                
                                {hasSubmission && (
                                    <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 h-5 px-2 gap-1 text-[10px] uppercase font-bold tracking-wide">
                                        <CheckCircle2 className="w-3 h-3" /> Submitted
                                    </Badge>
                                )}
                                
                                {!hasSubmission && isExpired && (
                                    <Badge variant="destructive" className="h-5 text-[10px]">CLOSED</Badge>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground leading-snug">
                                {description}
                            </p>

                            {!hasSubmission && !isExpired && (
                                <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium mt-2 w-fit px-2.5 py-1 rounded-full border",
                                    urgency === "critical" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" :
                                    urgency === "warning" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" :
                                    "bg-muted/50 text-muted-foreground border-border"
                                )}>
                                    <Clock className="w-3 h-3" /> 
                                    {timeLeft}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: ACTION AREA --- */}
                <div className="w-full md:w-[380px] shrink-0">
                    
                    {!showUploadForm ? (
                        <div className="bg-background/50 dark:bg-background/20 border border-emerald-100 dark:border-emerald-800/40 rounded-lg p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-background p-2.5 rounded-md border shadow-sm shrink-0">
                                    {isLinkType ? <Youtube className="w-5 h-5 text-red-500" /> : <FileIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                                        Current File
                                    </span>
                                    <span className="text-sm text-foreground truncate font-medium" title={submission.key || ""}>
                                        {/* FIX: submission.key can be undefined here, so we handle it */}
                                        {isLinkType ? (submission.key || "") : getFileNameFromKey(submission.key)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 w-full">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-input hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-600 dark:hover:text-emerald-400 h-9 font-medium shadow-sm" 
                                    asChild
                                >
                                    <a href={submission.url || "#"} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> 
                                        {isLinkType ? "Watch Video" : "View File"}
                                    </a>
                                </Button>
                                
                                {!isExpired && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setIsEditing(true);
                                            if (isLinkType && submission.key) setVideoLink(submission.key);
                                        }}
                                        title="Replace File"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={cn("space-y-3 transition-all", isEditing && "bg-muted/40 p-4 rounded-lg border border-dashed border-muted-foreground/20")}>
                            
                            {isEditing && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">Replacing Submission</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 hover:bg-background rounded-full"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}

                            {isLinkType ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Youtube className="w-4 h-4" />
                                        </div>
                                        <Input 
                                            placeholder="https://youtu.be/..." 
                                            className="text-sm h-10 pl-9 bg-background focus-visible:ring-indigo-500"
                                            value={videoLink}
                                            onChange={(e) => setVideoLink(e.target.value)}
                                            disabled={isExpired || isUploading}
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleLinkSubmit}
                                        disabled={isExpired || isUploading || !videoLink}
                                        className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept={accept}
                                        onChange={handleFileSelect}
                                        disabled={isExpired || isUploading}
                                    />
                                    
                                    {!selectedFile ? (
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-10 border-dashed border-2 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 bg-background/50 transition-all"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isExpired || isUploading}
                                        >
                                            <UploadCloud className="w-4 h-4 mr-2" /> 
                                            {isEditing ? "Select New File" : `Upload ${accept?.replace(/\./g, '').toUpperCase().split(',')[0] || "File"}`}
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex items-center gap-3 bg-background border rounded-md px-3 py-2 shadow-sm">
                                                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded text-indigo-600 dark:text-indigo-400">
                                                    <FileIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate text-foreground">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                    className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <Button 
                                                onClick={handleFileUpload}
                                                disabled={isUploading}
                                                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" /> 
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" /> Confirm Upload
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}