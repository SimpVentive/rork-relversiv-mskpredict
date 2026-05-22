import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

export const userRoleEnum = ["admin", "hospital", "researcher", "clinician"] as const;

export const conditionEnum = ["back", "shoulder", "knee"] as const;

export const riskBandEnum = ["Low", "Moderate", "High", "Very High"] as const;

export const clinicianCallEnum = ["green", "amber", "red"] as const;

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", userRoleEnum).notNull(),
  hospitalName: varchar("hospital_name", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const backAssessments = mysqlTable("back_assessments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  data: json("data").notNull(), // Full BackAssessment object
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shoulderAssessments = mysqlTable("shoulder_assessments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  data: json("data").notNull(), // Full ShoulderAssessment object
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const predictions = mysqlTable("predictions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  condition: mysqlEnum("condition", conditionEnum).notNull(),
  assessmentId: varchar("assessment_id", { length: 36 }), // Reference to back/shoulder assessment
  score: varchar("score", { length: 3 }).notNull(), // 0-100
  band: mysqlEnum("band", riskBandEnum).notNull(),
  predictedCall: mysqlEnum("predicted_call", clinicianCallEnum).notNull(),
  clinicianCall: mysqlEnum("clinician_call", clinicianCallEnum), // Ground truth, nullable
  firedRules: json("fired_rules").notNull(), // Array of { ruleId, evidence }
  chronicityWeeks: varchar("chronicity_weeks", { length: 3 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type BackAssessmentRow = typeof backAssessments.$inferSelect;
export type NewBackAssessmentRow = typeof backAssessments.$inferInsert;

export type ShoulderAssessmentRow = typeof shoulderAssessments.$inferSelect;
export type NewShoulderAssessmentRow = typeof shoulderAssessments.$inferInsert;

export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
