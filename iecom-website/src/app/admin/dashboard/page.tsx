import { getAdminDashboardData, adminLogout, getIecomLeaderboard } from "@/actions/server/admin";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { LeaderboardTable } from "@/components/admin/LeaderboardTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { RefreshBtn } from "@/components/admin/RefreshBtn";
import { TeamData } from "@/actions/types/Admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let data, leaderboard;
  
  try {
    // Parallel fetching for performance
    [data, leaderboard] = await Promise.all([
      getAdminDashboardData(),
      getIecomLeaderboard()
    ]);
  } catch (error) {
    console.error("Dashboard Load Error:", error);
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-500 mt-1">
              Welcome back, <span className="text-emerald-400 font-mono">{data.username}</span> ({data.role})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <RefreshBtn />
            <form action={adminLogout}>
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-900 text-zinc-300">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="iecom" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800 text-zinc-400 w-full justify-start h-auto p-1 overflow-x-auto">
            <TabsTrigger value="iecom" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-2 px-6">IECOM Competition</TabsTrigger>
            <TabsTrigger value="nice" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-6">NICE Competition</TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-2 px-6">IECOM Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="iecom" className="mt-6 animate-in fade-in-50">
             <AdminDataTable 
                data={data.iecomTeams as TeamData[]} 
                competition="IECOM" 
                role={data.role} 
             />
          </TabsContent>
          
          <TabsContent value="nice" className="mt-6 animate-in fade-in-50">
             <AdminDataTable 
                data={data.niceTeams as TeamData[]} 
                competition="NICE" 
                role={data.role} 
             />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6 animate-in fade-in-50">
             <LeaderboardTable data={leaderboard} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}