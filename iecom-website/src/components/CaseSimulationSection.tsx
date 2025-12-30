"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Briefcase } from "lucide-react";
import { DeliverableItem } from "./DeliverableItem";
import { TeamIECOM } from "@/actions/types/Competition";

const DEADLINES = {
    DRAFT: "2026-01-03T08:00:00+07:00",
    FINAL: "2026-01-16T08:00:00+07:00",
    VIDEO: "2026-01-16T08:00:00+07:00",
    INFOGRAPHIC: "2026-01-16T08:00:00+07:00",
};

export function CaseSimulationSection({ team }: { team: TeamIECOM }) {
    return (
        <Card className="border-l-4 border-l-indigo-500 shadow-sm mt-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-indigo-500 hover:bg-indigo-600">STEP 4</Badge>
                            <span className="text-sm font-medium text-muted-foreground">Main Event</span>
                        </div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                            Case Simulation
                        </CardTitle>
                        <CardDescription>
                            Download the case packet and submit your deliverables.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">

                 {/* Case Download */}
                 <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-900">Case Material Packet</h3>
                        <p className="text-sm text-indigo-700/80">Contains the case study PDF and supplementary data.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" asChild>
                        <a href="https://assets.iecom2026.com/Case%20IECOM.pdf" target="_blank">
                            <Download className="w-4 h-4 mr-2" /> Download Packet
                        </a>
                    </Button>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider pl-1">Required Deliverables</h3>
                    
                    <DeliverableItem 
                        teamId={team.team_id}
                        title="Initial Draft"
                        description="Submit your preliminary analysis (PDF)."
                        deadlineISO={DEADLINES.DRAFT}
                        type="initial_draft"
                        accept=".pdf"
                        currentValue={team.initialDraftLink}
                    />
                    <DeliverableItem 
                        teamId={team.team_id}
                        title="Final Report"
                        description="Complete solution and recommendation (PDF)."
                        deadlineISO={DEADLINES.FINAL}
                        type="final_report"
                        accept=".pdf"
                        currentValue={team.finalReportLink}
                    />
                    <DeliverableItem 
                        teamId={team.team_id}
                        title="Video Presentation"
                        description="YouTube link of your team's presentation."
                        deadlineISO={DEADLINES.VIDEO}
                        type="video_link"
                        currentValue={team.videoLink}
                    />
                    <DeliverableItem 
                        teamId={team.team_id}
                        title="Infographic"
                        description="Visual summary of your solution (PNG/JPG/PDF)."
                        deadlineISO={DEADLINES.INFOGRAPHIC}
                        type="infographic"
                        accept=".pdf, .png, .jpg, .jpeg"
                        currentValue={team.infographicLink}
                    />
                </div>
            </CardContent>
        </Card>
    );
}