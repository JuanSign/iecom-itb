"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    UploadCloud, FileText, Youtube, CheckCircle2, 
    Clock, File as FileIcon, Loader2, X, ExternalLink,
    Image as ImageIcon, RefreshCw, Undo2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadDeliverable, submitVideoLink } from "@/actions/server/competition/iecom/case-simulation";

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
}

export function DeliverableItem({
    teamId,
    title,
    description,
    deadlineISO,
    type,
    accept,
    currentValue
}: DeliverableItemProps) {
    const [timeLeft, setTimeLeft] = useState("");
    const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">("normal");
    const [isExpired, setIsExpired] = useState(false);
    
    // Upload & Edit States
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // File State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Link State
    const [videoLink, setVideoLink] = useState("");

    const isLinkType = type === 'video_link';

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

            if (days > 0) setTimeLeft(`${days}d ${hours}h remaining`);
            else setTimeLeft(`${hours}h ${minutes}m remaining`);
        };
        calculateTime();
        const timer = setInterval(calculateTime, 60000);
        return () => clearInterval(timer);
    }, [deadlineISO]);

    // --- Handlers ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File is too large. Max size is 2MB.");
            e.target.value = ""; 
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        if (type === 'video_link') {
            toast.error("Invalid upload type.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await uploadDeliverable(teamId, type, formData);
            toast.success("Uploaded successfully!");
            
            // ✅ FIX: Reset state here explicitly on success
            setIsEditing(false);
            setSelectedFile(null);
            
            // Clear input so selecting the same file works again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
            
        } catch {
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleLinkSubmit = async () => {
        if (!videoLink) return;
        setIsUploading(true);
        try {
            await submitVideoLink(teamId, videoLink);
            toast.success("Link saved successfully!");

            // ✅ FIX: Reset state here explicitly on success
            setIsEditing(false);
            setVideoLink("");
            
        } catch {
            toast.error("Failed to save link");
        } finally {
            setIsUploading(false);
        }
    };

    // Helper to extract a readable name from the URL
    const getFileNameFromUrl = (url: string) => {
        try {
            const parts = url.split('/');
            return parts[parts.length - 1];
        } catch {
            return "view-file";
        }
    };

    const showUploadForm = !currentValue || isEditing;

    return (
        <Card className={cn(
            "border transition-all duration-300", 
            currentValue && !isEditing 
                ? "bg-white border-emerald-200 shadow-sm" 
                : "bg-card border-border hover:border-muted-foreground/30"
        )}>
            <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-start justify-between">
                
                {/* --- LEFT: INFO SECTION --- */}
                <div className="flex-1 space-y-3 min-w-0 w-full">
                    <div className="flex items-start gap-3">
                        {/* Icon Box */}
                        <div className={cn(
                            "p-2.5 rounded-xl shrink-0 border transition-colors", 
                            currentValue 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                : "bg-muted/50 border-border text-muted-foreground"
                        )}>
                            {isLinkType ? <Youtube className="w-5 h-5" /> : 
                             type === 'infographic' ? <ImageIcon className="w-5 h-5" /> : 
                             <FileText className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center gap-3 w-full">
                                <h4 className={cn("font-semibold text-base", currentValue ? "text-emerald-950" : "text-foreground")}>
                                    {title}
                                </h4>
                                
                                {currentValue && (
                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 h-5 px-2 gap-1 text-[10px] uppercase font-bold tracking-wide">
                                        <CheckCircle2 className="w-3 h-3" /> Done
                                    </Badge>
                                )}
                                
                                {!currentValue && isExpired && (
                                    <Badge variant="destructive" className="h-5 text-[10px]">CLOSED</Badge>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground leading-snug">
                                {description}
                            </p>

                            {/* Countdown Pill */}
                            {!currentValue && !isExpired && (
                                <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium mt-1 w-fit px-2 py-0.5 rounded-full border",
                                    urgency === "critical" ? "bg-red-50 text-red-600 border-red-100 animate-pulse" :
                                    urgency === "warning" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-50 text-slate-500 border-slate-100"
                                )}>
                                    <Clock className="w-3 h-3" /> 
                                    {timeLeft}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: ACTION AREA --- */}
                <div className="w-full md:w-[360px] shrink-0">
                    
                    {!showUploadForm ? (
                        // === STATE: SUBMITTED (FILE VIEW) ===
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-white p-2 rounded-md border border-emerald-100 shadow-sm shrink-0">
                                        {isLinkType ? <Youtube className="w-4 h-4 text-red-500" /> : <FileIcon className="w-4 h-4 text-indigo-500" />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                                            Current Submission
                                        </span>
                                        <span className="text-sm text-emerald-600 truncate font-medium" title={getFileNameFromUrl(currentValue!)}>
                                            {isLinkType ? currentValue : getFileNameFromUrl(currentValue!)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" size="sm" className="flex-1 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 h-8" asChild>
                                    <a href={currentValue!} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View
                                    </a>
                                </Button>
                                {!isExpired && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="flex-1 h-8 text-muted-foreground hover:text-foreground hover:bg-emerald-100/50"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Replace
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // === STATE: UPLOAD / EDIT ===
                        <div className={cn("space-y-3", isEditing && "bg-muted/30 p-3 rounded-lg border border-dashed border-muted-foreground/20")}>
                            
                            {isEditing && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">Update Submission</span>
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
                                // LINK INPUT
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Youtube className="w-4 h-4" />
                                        </div>
                                        <Input 
                                            placeholder="https://youtu.be/..." 
                                            className="text-sm h-10 pl-9 bg-background"
                                            value={videoLink}
                                            onChange={(e) => setVideoLink(e.target.value)}
                                            disabled={isExpired || isUploading}
                                        />
                                    </div>
                                    <Button 
                                        onClick={handleLinkSubmit}
                                        disabled={isExpired || isUploading || !videoLink}
                                        className="h-10"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                    </Button>
                                </div>
                            ) : (
                                // FILE UPLOAD
                                <div className="flex flex-col gap-2">
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
                                            className="w-full h-10 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-background bg-background/50"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isExpired || isUploading}
                                        >
                                            <UploadCloud className="w-4 h-4 mr-2" /> 
                                            {isEditing ? "Select New File" : `Upload ${accept?.replace(/\./g, '').toUpperCase() || "File"}`}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex-1 flex items-center gap-2 bg-background border rounded-md px-3 h-10 overflow-hidden shadow-sm">
                                                <FileIcon className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                                                <button 
                                                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <Button 
                                                onClick={handleFileUpload}
                                                disabled={isUploading}
                                                className="h-10 px-4"
                                            >
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between px-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Max 2MB</span>
                                        {accept && <span className="text-[10px] text-muted-foreground uppercase">{accept}</span>}
                                    </div>
                                </div>
                            )}

                            {/* Cancel Button for Edit Mode */}
                            {isEditing && !selectedFile && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditing(false)} 
                                    className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <Undo2 className="w-3 h-3 mr-1.5" /> Cancel Replacement
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}