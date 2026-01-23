import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { niceTeam, niceMember, iecomTeam, iecomMember } from "@/lib/schema";

// --- Schema Inference ---
export type NiceTeam = InferSelectModel<typeof niceTeam>;
export type IecomTeam = InferSelectModel<typeof iecomTeam>;
export type NiceMember = InferSelectModel<typeof niceMember>;
export type IecomMember = InferSelectModel<typeof iecomMember>;

// --- Insert/Update Models ---
export type NiceTeamInsert = InferInsertModel<typeof niceTeam>;
export type IecomTeamInsert = InferInsertModel<typeof iecomTeam>;
export type NiceMemberInsert = InferInsertModel<typeof niceMember>;
export type IecomMemberInsert = InferInsertModel<typeof iecomMember>;

// --- Helper Union Types ---
export type CompetitionType = "NICE" | "IECOM";
export type UpdateAction = "update" | "remove_note" | "add_note";
export type ScalarValue = string | number;