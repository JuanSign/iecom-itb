import { pgTable, unique, uuid, text, timestamp, foreignKey, serial, integer, check, jsonb, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const difficulty = pgEnum("difficulty", ['easy', 'medium', 'hard'])


export const account = pgTable("account", {
	accountId: uuid("account_id").defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	events: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("account_email_key").on(table.email),
]);

export const iecomTeamAssignment = pgTable("iecom_team_assignment", {
	id: serial().primaryKey().notNull(),
	memberAccountId: uuid("member_account_id").notNull(),
	packetId: integer("packet_id").notNull(),
	progressId: integer("progress_id"),
}, (table) => [
	foreignKey({
			columns: [table.progressId],
			foreignColumns: [iecomTeamSelectionProgress.id],
			name: "iecom_team_assignment_progress_id_iecom_team_selection_progress"
		}),
]);

export const niceTeam = pgTable("nice_team", {
	teamId: uuid("team_id").defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	status: integer().default(0),
	messages: text().array(),
	count: integer().default(0),
	notes: text().array(),
	bmcLink: text("bmc_link"),
	pooLink: text("poo_link"),
	submissionStatus: integer("submission_status").default(0).notNull(),
	paymentProofLink: text("payment_proof_link"),
	proposalLink: text("proposal_link"),
	paymentVerified: integer("payment_verified").default(0),
	proposalVerified: integer("proposal_verified").default(0),
}, (table) => [
	unique("unique_team_name_nice").on(table.name),
	check("nice_team_code_check", sql`code ~ '^[A-Z]{5}$'::text`),
]);

export const iecomTeam = pgTable("iecom_team", {
	teamId: uuid("team_id").defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	code: text().notNull(),
	status: integer().default(0),
	messages: text().array(),
	count: integer().default(0),
	notes: text().array(),
	ppLink: text("pp_link"),
	ppVerified: integer("pp_verified").default(0).notNull(),
	initialDraftLink: text("initial_draft_link"),
	finalReportLink: text("final_report_link"),
	videoLink: text("video_link"),
	infographicLink: text("infographic_link"),
}, (table) => [
	unique("unique_team_name_iecom").on(table.name),
	check("iecom_team_code_check", sql`code ~ '^[A-Z]{5}$'::text`),
]);

export const adminUsers = pgTable("admin_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("admin_users_username_key").on(table.username),
	check("admin_users_role_check", sql`role = ANY (ARRAY['ADMIN'::text, 'VIEWER'::text])`),
]);

export const iecomTeamRequest = pgTable("iecom_team_request", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	accountId: uuid("account_id").notNull(),
	name: text().notNull(),
	institution: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [iecomTeam.teamId],
			name: "iecom_team_request_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.accountId],
			name: "iecom_team_request_account_id_fkey"
		}).onDelete("cascade"),
]);

export const niceTeamRequest = pgTable("nice_team_request", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	accountId: uuid("account_id").notNull(),
	name: text().notNull(),
	institution: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [niceTeam.teamId],
			name: "nice_team_request_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.accountId],
			name: "nice_team_request_account_id_fkey"
		}).onDelete("cascade"),
]);

export const iecomProblem = pgTable("iecom_problem", {
	id: serial().primaryKey().notNull(),
	packetId: integer("packet_id").notNull(),
	difficulty: difficulty().notNull(),
	content: text().notNull(),
	imageUrl: text("image_url"),
	options: jsonb().notNull(),
});

export const iecomTeamSelectionProgress = pgTable("iecom_team_selection_progress", {
	id: serial().primaryKey().notNull(),
	teamId: uuid("team_id"),
	startTime: timestamp("start_time", { mode: 'string' }).defaultNow(),
	endTime: timestamp("end_time", { mode: 'string' }),
	isCheatingFlagged: boolean("is_cheating_flagged").default(false),
	cheatingReason: text("cheating_reason"),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [iecomTeam.teamId],
			name: "iecom_team_selection_progress_team_id_iecom_team_team_id_fk"
		}),
]);

export const iecomSubmission = pgTable("iecom_submission", {
	id: serial().primaryKey().notNull(),
	memberAccountId: uuid("member_account_id").notNull(),
	problemId: integer("problem_id"),
	selectedOptionId: text("selected_option_id").notNull(),
	isCorrect: boolean("is_correct").notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.problemId],
			foreignColumns: [iecomProblem.id],
			name: "iecom_submission_problem_id_iecom_problem_id_fk"
		}),
]);

export const iecomMember = pgTable("iecom_member", {
	teamId: uuid("team_id").notNull(),
	accountId: uuid("account_id").notNull(),
	role: text().default('MEMBER').notNull(),
	name: text(),
	email: text().notNull(),
	institution: text(),
	phoneNum: text("phone_num"),
	idNo: text("id_no"),
	scLink: text("sc_link"),
	scVerified: integer("sc_verified").default(0).notNull(),
	sdLink: text("sd_link"),
	sdVerified: integer("sd_verified").default(0).notNull(),
	fpLink: text("fp_link"),
	fpVerified: integer("fp_verified").default(0).notNull(),
	status: integer().default(0),
	notes: text().array(),
	spLink: text("sp_link"),
	spVerified: integer("sp_verified").default(0),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [iecomTeam.teamId],
			name: "iecom_member_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.accountId],
			name: "iecom_member_account_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.teamId, table.accountId], name: "iecom_member_pkey"}),
]);

export const niceMember = pgTable("nice_member", {
	teamId: uuid("team_id").notNull(),
	accountId: uuid("account_id").notNull(),
	role: text().default('MEMBER').notNull(),
	name: text(),
	email: text().notNull(),
	institution: text(),
	phoneNum: text("phone_num"),
	idNo: text("id_no"),
	scLink: text("sc_link"),
	scVerified: integer("sc_verified").default(0).notNull(),
	sdLink: text("sd_link"),
	sdVerified: integer("sd_verified").default(0).notNull(),
	fpLink: text("fp_link"),
	fpVerified: integer("fp_verified").default(0).notNull(),
	status: integer().default(0),
	notes: text().array(),
	spLink: text("sp_link"),
	spVerified: integer("sp_verified").default(0),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [niceTeam.teamId],
			name: "nice_member_team_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.accountId],
			name: "nice_member_account_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.teamId, table.accountId], name: "nice_member_pkey"}),
]);

export type ProblemOption = {
  id: string;
  type: 'text' | 'image';
  value: string;
};