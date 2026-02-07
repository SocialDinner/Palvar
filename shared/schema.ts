import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const bookingRequests = pgTable("booking_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  message: text("message"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  marketingConsent: boolean("marketing_consent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingRequestSchema = createInsertSchema(bookingRequests).omit({
  id: true,
  createdAt: true,
}).extend({
  consentTimestamp: z.union([z.string(), z.date(), z.null()]).optional().transform(val => 
    val ? (typeof val === 'string' ? new Date(val) : val) : null
  ),
});

export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type BookingRequest = typeof bookingRequests.$inferSelect;

// Handwerkspartner-Registrierungen
export const partnerRegistrations = pgTable("partner_registrations", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  website: text("website"),
  trades: text("trades").array().notNull(),
  employees: text("employees").notNull(),
  experience: text("experience").notNull(),
  motivation: text("motivation").notNull(),
  certifications: text("certifications"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerRegistrationSchema = createInsertSchema(partnerRegistrations).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertPartnerRegistration = z.infer<typeof insertPartnerRegistrationSchema>;
export type PartnerRegistration = typeof partnerRegistrations.$inferSelect;

// Rechner-Ergebnisse (Calculator Submissions)
export const calculatorSubmissions = pgTable("calculator_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name"),
  calculatorType: text("calculator_type").notNull(),
  inputs: text("inputs").notNull(), // JSON string of inputs
  results: text("results").notNull(), // JSON string of results
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalculatorSubmissionSchema = createInsertSchema(calculatorSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculatorSubmission = z.infer<typeof insertCalculatorSubmissionSchema>;
export type CalculatorSubmission = typeof calculatorSubmissions.$inferSelect;

// Karriere-Anfragen (Career Applications)
export const careerApplications = pgTable("career_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position").notNull(),
  experience: text("experience"),
  motivation: text("motivation"),
  resumeUrl: text("resume_url"),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCareerApplicationSchema = createInsertSchema(careerApplications).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertCareerApplication = z.infer<typeof insertCareerApplicationSchema>;
export type CareerApplication = typeof careerApplications.$inferSelect;
