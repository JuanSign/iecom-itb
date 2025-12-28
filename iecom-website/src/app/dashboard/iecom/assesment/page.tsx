import { redirect } from "next/navigation";
import { db } from "@/lib/DB";
import { 
  iecomTeamAssignment, 
  iecomTeamSelectionProgress, 
  iecomProblem,
  iecomSubmission,
  type ProblemOption 
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/actions/server/session";
import { ExamInterface, SafeProblem } from "@/components/Exam/ExamInterface";

// --- SERVER-SIDE SHUFFLE HELPER ---
// Randomizes the options array so "Answer A" isn't always the correct one on the frontend
function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default async function ExamPage() {
  // 1. AUTHENTICATION (Session Cookie)
  const session = await verifySession();
  
  if (!session || !session.account_id) {
    redirect("/login");
  }
  
  const currentUserAccountId = session.account_id;

  // 2. FETCH ASSIGNMENT & PROGRESS
  // We join Assignment + Progress to get Packet ID + Timer End Time in one go
  const assignmentData = await db
    .select({
      packetId: iecomTeamAssignment.packetId,
      startTime: iecomTeamSelectionProgress.startTime,
      endTime: iecomTeamSelectionProgress.endTime,
    })
    .from(iecomTeamAssignment)
    .innerJoin(
      iecomTeamSelectionProgress,
      eq(iecomTeamAssignment.progressId, iecomTeamSelectionProgress.id)
    )
    .where(eq(iecomTeamAssignment.memberAccountId, currentUserAccountId))
    .limit(1);

  const assignment = assignmentData[0];

  // LOGIC CHECK A: Not assigned yet?
  if (!assignment) {
    // User tried to access /exam without clicking "Start" on dashboard
    redirect("/dashboard/iecom/team");
  }
  
  // LOGIC CHECK B: Time over?
  const now = new Date();
  const endTime = assignment.endTime ? new Date(assignment.endTime) : new Date();
  
  if (now > endTime) {
    redirect("/iecom/exam/finished");
  }

  // 3. FETCH PROBLEMS FOR ASSIGNED PACKET
  // Order by difficulty (Easy -> Medium -> Hard) or ID to keep consistent order
  const rawProblems = await db
    .select()
    .from(iecomProblem)
    .where(eq(iecomProblem.packetId, assignment.packetId))
    .orderBy(iecomProblem.id); 

  // 4. FETCH EXISTING ANSWERS (Resume Capability)
  // If user refreshed or logged out, we restore their checkmarks
  const existingSubmissions = await db
    .select()
    .from(iecomSubmission)
    .where(eq(iecomSubmission.memberAccountId, currentUserAccountId));

  // Create a map for fast lookup: ProblemID -> SelectedOptionID
  const submissionMap = new Map<number, string>();
  existingSubmissions.forEach(sub => {
    if(sub.problemId && sub.selectedOptionId) {
        submissionMap.set(sub.problemId, sub.selectedOptionId);
    }
  });

  // 5. DATA PREPARATION (Secure Shuffle)
  const secureProblems: SafeProblem[] = rawProblems.map((prob) => {
    // Cast the JSONB back to our type
    const options = prob.options as ProblemOption[];
    
    return {
      id: prob.id,
      content: prob.content,
      imageUrl: prob.imageUrl,
      difficulty: prob.difficulty as 'easy' | 'medium' | 'hard',
      // CRITICAL: We shuffle options here before sending to Client
      options: shuffle(options), 
      // Attach pre-filled answer if it exists
      initialAnswerId: submissionMap.get(prob.id) 
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <ExamInterface 
        problems={secureProblems} 
        endTime={endTime.getTime()}
      />
    </div>
  );
}