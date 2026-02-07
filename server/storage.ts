import { 
  users, 
  bookingRequests, 
  partnerRegistrations,
  calculatorSubmissions,
  careerApplications,
  type User, 
  type InsertUser, 
  type BookingRequest, 
  type InsertBookingRequest,
  type PartnerRegistration,
  type InsertPartnerRegistration,
  type CalculatorSubmission,
  type InsertCalculatorSubmission,
  type CareerApplication,
  type InsertCareerApplication
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  testConnection(): Promise<boolean>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBookingRequest(request: InsertBookingRequest): Promise<BookingRequest>;
  getBookingRequests(): Promise<BookingRequest[]>;
  createPartnerRegistration(registration: InsertPartnerRegistration): Promise<PartnerRegistration>;
  getPartnerRegistrations(): Promise<PartnerRegistration[]>;
  createCalculatorSubmission(submission: InsertCalculatorSubmission): Promise<CalculatorSubmission>;
  getCalculatorSubmissions(): Promise<CalculatorSubmission[]>;
  createCareerApplication(application: InsertCareerApplication): Promise<CareerApplication>;
  getCareerApplications(): Promise<CareerApplication[]>;
}

export class DatabaseStorage implements IStorage {
  async testConnection(): Promise<boolean> {
    try {
      await db.select().from(users).limit(1);
      return true;
    } catch {
      return false;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBookingRequest(insertRequest: InsertBookingRequest): Promise<BookingRequest> {
    const [request] = await db
      .insert(bookingRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getBookingRequests(): Promise<BookingRequest[]> {
    return await db.select().from(bookingRequests);
  }

  async createPartnerRegistration(insertRegistration: InsertPartnerRegistration): Promise<PartnerRegistration> {
    const [registration] = await db
      .insert(partnerRegistrations)
      .values(insertRegistration)
      .returning();
    return registration;
  }

  async getPartnerRegistrations(): Promise<PartnerRegistration[]> {
    return await db.select().from(partnerRegistrations);
  }

  async createCalculatorSubmission(insertSubmission: InsertCalculatorSubmission): Promise<CalculatorSubmission> {
    const [submission] = await db
      .insert(calculatorSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getCalculatorSubmissions(): Promise<CalculatorSubmission[]> {
    return await db.select().from(calculatorSubmissions);
  }

  async createCareerApplication(insertApplication: InsertCareerApplication): Promise<CareerApplication> {
    const [application] = await db
      .insert(careerApplications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getCareerApplications(): Promise<CareerApplication[]> {
    return await db.select().from(careerApplications);
  }
}

export const storage = new DatabaseStorage();
