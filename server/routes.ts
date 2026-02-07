import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingRequestSchema, insertCareerApplicationSchema } from "@shared/schema";
import { createBookingContact, createPartnerContact, createCalculatorContact, createCareerContact } from "./hubspot";
import { z } from "zod";

// Calculator submission schema
const calculatorSubmissionSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  name: z.string().optional(),
  calculatorType: z.string(),
  results: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })),
  inputs: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint with database connectivity test
  app.get("/api/health", async (req, res) => {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = hasDbUrl ? process.env.DATABASE_URL?.substring(0, 20) + "..." : "not set";
    
    try {
      // Test database connectivity
      const dbTest = await storage.testConnection();
      res.json({ 
        status: "ok", 
        database: dbTest ? "connected" : "error",
        database_url_set: hasDbUrl,
        database_url_preview: dbUrlPrefix,
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.json({ 
        status: "ok", 
        database: "error",
        database_url_set: hasDbUrl,
        database_url_preview: dbUrlPrefix,
        error_message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // Booking request - saves to DB + syncs to HubSpot (HubSpot handles emails via workflows)
  // Also available as /api/booking for API compatibility
  const handleBooking = async (req: any, res: any) => {
    try {
      const parsed = insertBookingRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Ungültige Anfrage", 
          details: parsed.error.errors 
        });
      }

      // Save to database
      const bookingRequest = await storage.createBookingRequest(parsed.data);
      
      console.log("New booking request saved to DB:", {
        id: bookingRequest.id,
        name: bookingRequest.name,
        email: bookingRequest.email,
        service: bookingRequest.service,
        createdAt: bookingRequest.createdAt
      });

      // Sync to HubSpot CRM - HubSpot workflows will handle confirmation emails
      try {
        await createBookingContact({
          name: bookingRequest.name,
          email: bookingRequest.email,
          phone: bookingRequest.phone || undefined,
          service: bookingRequest.service,
          message: bookingRequest.message || undefined,
          packageType: req.body.packageType,
          buildingType: req.body.buildingType,
        });
        console.log("HubSpot contact synced - workflow will send confirmation email");
      } catch (hubspotError) {
        console.error("Error syncing to HubSpot:", hubspotError);
      }

      return res.status(201).json({ 
        success: true, 
        message: "Anfrage erfolgreich gesendet",
        booking_id: bookingRequest.id,
        id: bookingRequest.id 
      });
    } catch (error) {
      console.error("Error creating booking request:", error);
      return res.status(500).json({ 
        error: "Interner Serverfehler" 
      });
    }
  };

  // Register booking endpoints
  app.post("/api/anfrage", handleBooking);
  app.post("/api/booking", handleBooking);

  app.get("/api/anfrage", async (req, res) => {
    try {
      const requests = await storage.getBookingRequests();
      return res.json(requests);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      return res.status(500).json({ error: "Interner Serverfehler" });
    }
  });

  // Calculator results - saves to DB + syncs to HubSpot (HubSpot handles emails via workflows)
  app.post("/api/calculator/send-results", async (req, res) => {
    try {
      const parsed = calculatorSubmissionSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Ungültige Anfrage", 
          details: parsed.error.errors 
        });
      }

      const { email, name, calculatorType, results, inputs } = parsed.data;

      // Save to database
      const submission = await storage.createCalculatorSubmission({
        email,
        name: name || null,
        calculatorType,
        inputs: JSON.stringify(inputs),
        results: JSON.stringify(results),
      });

      console.log("Calculator submission saved to DB:", {
        id: submission.id,
        email,
        calculatorType,
      });

      // Sync to HubSpot - workflow will handle email
      try {
        await createCalculatorContact({
          email,
          name,
          calculatorType,
        });
        console.log("HubSpot calculator contact synced - workflow will send results email");
      } catch (hubspotError) {
        console.error("Error syncing calculator to HubSpot:", hubspotError);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Ergebnisse gespeichert" 
      });
    } catch (error) {
      console.error("Error saving calculator submission:", error);
      return res.status(500).json({ 
        error: "Speichern fehlgeschlagen" 
      });
    }
  });

  // Partner registration - saves to DB + syncs to HubSpot
  const partnerRegistrationSchema = z.object({
    companyName: z.string().min(2),
    contactPerson: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    address: z.string().min(5),
    website: z.string().optional(),
    trades: z.array(z.string()).min(1),
    employees: z.string().min(1),
    experience: z.string().min(10),
    motivation: z.string().min(20),
    certifications: z.string().optional(),
  });

  app.post("/api/partner", async (req, res) => {
    try {
      const parsed = partnerRegistrationSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Ungültige Anfrage", 
          details: parsed.error.errors 
        });
      }

      const data = parsed.data;
      
      // Save to database
      const registration = await storage.createPartnerRegistration(data);
      
      console.log("Partner registration saved to DB:", {
        id: registration.id,
        companyName: data.companyName,
        email: data.email,
      });

      // Sync to HubSpot CRM - workflow will handle emails
      try {
        await createPartnerContact({
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          address: data.address,
          website: data.website,
          trades: data.trades,
        });
        console.log("HubSpot partner contact synced - workflow will send confirmation");
      } catch (hubspotError) {
        console.error("Error syncing partner to HubSpot:", hubspotError);
      }

      return res.status(201).json({ 
        success: true, 
        message: "Registrierung erfolgreich gesendet",
        id: registration.id
      });
    } catch (error) {
      console.error("Error processing partner registration:", error);
      return res.status(500).json({ 
        error: "Interner Serverfehler" 
      });
    }
  });

  // Career application - saves to DB + syncs to HubSpot
  app.post("/api/karriere", async (req, res) => {
    try {
      const parsed = insertCareerApplicationSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Ungültige Anfrage", 
          details: parsed.error.errors 
        });
      }

      // Save to database
      const application = await storage.createCareerApplication(parsed.data);
      
      console.log("Career application saved to DB:", {
        id: application.id,
        name: application.name,
        email: application.email,
        position: application.position,
      });

      // Sync to HubSpot CRM - workflow will handle emails
      try {
        await createCareerContact({
          name: application.name,
          email: application.email,
          phone: application.phone || undefined,
          position: application.position,
        });
        console.log("HubSpot career contact synced - workflow will send confirmation");
      } catch (hubspotError) {
        console.error("Error syncing career to HubSpot:", hubspotError);
      }

      return res.status(201).json({ 
        success: true, 
        message: "Bewerbung erfolgreich gesendet",
        id: application.id
      });
    } catch (error) {
      console.error("Error processing career application:", error);
      return res.status(500).json({ 
        error: "Interner Serverfehler" 
      });
    }
  });

  app.get("/api/karriere", async (req, res) => {
    try {
      const applications = await storage.getCareerApplications();
      return res.json(applications);
    } catch (error) {
      console.error("Error fetching career applications:", error);
      return res.status(500).json({ error: "Interner Serverfehler" });
    }
  });

  return httpServer;
}
