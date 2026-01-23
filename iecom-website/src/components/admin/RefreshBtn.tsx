"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshBtn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
        setLoading(true);
        router.refresh();
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="border-zinc-700 hover:bg-zinc-800 text-zinc-400">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
        </Button>
    );
}