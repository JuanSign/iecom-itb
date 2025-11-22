"use client";

import { useActionState } from "react";
import { adminLogin } from "@/actions/server/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-10 w-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <p className="text-sm text-zinc-500">Restricted Access Only</p>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Input 
                name="username" 
                placeholder="Username" 
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                required 
              />
            </div>
            <div className="space-y-2">
              <Input 
                name="password" 
                type="password" 
                placeholder="Password" 
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                required 
              />
            </div>
            
            {state.error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {state.error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" 
              disabled={pending}
            >
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authenticate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}