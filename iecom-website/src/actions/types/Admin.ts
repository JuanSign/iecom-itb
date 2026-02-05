export const VERIFICATION_STATUS = {
  PENDING: 0,
  REJECTED: 1,
  VERIFIED: 2,
} as const;

export const SUBMISSION_STAGE = {
  REGISTERED: 0,
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3,
} as const;

export type CompetitionType = "NICE" | "IECOM";
export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS];

// Common interface for both competitions
export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phoneNum: string | null;
  institution: string | null;
  idNo: string | null;
  notes: string[] | null;
  status: number;
  // Verification fields
  scVerified: VerificationStatus; scLink: string | null;
  fpVerified: VerificationStatus; fpLink: string | null;
  sdVerified: VerificationStatus; sdLink: string | null;
  spVerified: VerificationStatus; spLink: string | null;
}

export interface TeamData {
  teamId: string;
  name: string;
  code: string;
  status: number;
  notes: string[] | null;
  members: TeamMember[];
  
  paymentProofLink?: string | null;
  paymentVerified?: VerificationStatus;
  
  ppVerified?: VerificationStatus; 
  initialDraftLink?: string | null;
  finalReportLink?: string | null;
  videoLink?: string | null;
  infographicLink?: string | null;

  submissionStatus?: number;
  bmcLink?: string | null;
  pooLink?: string | null;
  proposalLink?: string | null;
  proposalVerified?: VerificationStatus;
  
  commitmentLink?: string | null;
  commitmentAt?: Date | string | null; 
  bannerLink?: string | null;
  bannerAt?: Date | string | null;    
  pptLink?: string | null;
  pptAt?: Date | string | null;       
}

export type AdminFormState = {
  error?: string;
  message?: string;
};

export interface LeaderboardMember {
  name: string;
  score: number;
}

export interface LeaderboardTeam {
  teamId: string;
  teamName: string;
  totalScore: number;
  rank: number;
  members: LeaderboardMember[];
}