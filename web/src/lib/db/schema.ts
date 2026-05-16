import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  enumType,
} from "drizzle-orm/pg-core";

export const userRoleEnum = enumType("user_role", [
  "admin",
  "hospital",
  "researcher",
  "clinician",
]);

export const conditionEnum = enumType("condition_type", [
  "back",
  "shoulder",
  "knee",
]);

export const riskBandEnum = enumType("risk_band", [
  "Low",
  "Moderate",
  "High",
  "Very High",
]);

export const clinicianCallEnum = enumType("clinician_call", [
  "green",
  "amber",
  "red",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  hospitalName: varchar("hospital_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const backAssessments = pgTable("back_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(), // Full BackAssessment object
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const shoulderAssessments = pgTable("shoulder_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(), // Full ShoulderAssessment object
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  condition: conditionEnum("condition").notNull(),
  assessmentId: uuid("assessment_id"), // Reference to back/shoulder assessment
  score: varchar("score", { length: 3 }).notNull(), // 0-100
  band: riskBandEnum("band").notNull(),
  predictedCall: clinicianCallEnum("predicted_call").notNull(),
  clinicianCall: clinicianCallEnum("clinician_call"), // Ground truth, nullable
  firedRules: jsonb("fired_rules").notNull(), // Array of { ruleId, evidence }
  chronicityWeeks: varchar("chronicity_weeks", { length: 3 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type BackAssessmentRow = typeof backAssessments.$inferSelect;
export type NewBackAssessmentRow = typeof backAssessments.$inferInsert;

export type ShoulderAssessmentRow = typeof shoulderAssessments.$inferSelect;
export type NewShoulderAssessmentRow = typeof shoulderAssessments.$inferInsert;

export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
