import type { Express, Response, Request as ExpressRequest } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertChatMessageSchema, insertUserProgressSchema,
  User
} from "@shared/schema";
import { z } from "zod";
import { ValidationError } from "zod-validation-error";
import { generateAIResponse } from "./openai";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Define Request interface that extends ExpressRequest
interface Request extends ExpressRequest {
  user?: User;
}

// Utility function to safely access user
function getUser(req: Request, res: Response): User | null {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized - User not found" });
    return null;
  }
  return req.user;
}

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const authMiddleware = async (req: Request, res: Response, next: Function) => {
  const token = req.cookies[COOKIE_NAME];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
  
  const session = await storage.getSessionByToken(token);
  if (!session) {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
  
  const user = await storage.getUser(session.userId);
  if (!user) {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ message: "Unauthorized - User not found" });
  }
  
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const registerSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
        referralCode: z.string().optional(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
      
      const userData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate unique referral code
      const referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        referralCode,
      });
      
      // If user was referred, create referral record
      if (userData.referralCode) {
        const referrer = await storage.getUserByReferralCode(userData.referralCode);
        if (referrer) {
          await storage.createReferral({
            referrerUserId: referrer.id,
            referredUserId: user.id,
            isSchool: false,
            commissionPaid: false,
          });
          
          // Reward referrer with points
          await storage.updateUserPoints(referrer.id, 500);
        }
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set cookie
      res.cookie(COOKIE_NAME, session.token, COOKIE_OPTIONS);
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginSchema = z.object({
        username: z.string(),
        password: z.string(),
      });
      
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set cookie
      res.cookie(COOKIE_NAME, session.token, COOKIE_OPTIONS);
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", authMiddleware, async (req: Request, res: Response) => {
    const token = req.cookies[COOKIE_NAME];
    if (token) {
      await storage.deleteSession(token);
      res.clearCookie(COOKIE_NAME);
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
  
  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });
  
  // User progress routes
  app.get("/api/user/progress", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const progress = await storage.getUserProgress(user.id);
    res.status(200).json(progress);
  });
  
  app.post("/api/user/progress", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    try {
      const progressSchema = insertUserProgressSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const module = await storage.getModule(progressSchema.moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const progress = await storage.updateUserProgress(
        progressSchema.userId,
        progressSchema.moduleId,
        progressSchema.progress
      );
      
      // If module completed, award points
      if (progressSchema.progress === 100 && progressSchema.isCompleted) {
        await storage.updateUserPoints(user.id, module.points);
        
        // Check for achievements that can be unlocked
        const achievements = await storage.getAchievements();
        for (const achievement of achievements) {
          if (achievement.requirement.includes(module.title)) {
            await storage.unlockAchievement(user.id, achievement.id);
          }
        }
      }
      
      res.status(200).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });
  
  // Module routes
  app.get("/api/modules", async (req: Request, res: Response) => {
    const modules = await storage.getModules();
    res.status(200).json(modules);
  });
  
  app.get("/api/modules/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid module ID" });
    }
    
    const module = await storage.getModule(id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    
    res.status(200).json(module);
  });
  
  app.get("/api/modules/category/:category", async (req: Request, res: Response) => {
    const category = req.params.category;
    const modules = await storage.getModulesByCategory(category);
    res.status(200).json(modules);
  });
  
  // Achievement routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    const achievements = await storage.getAchievements();
    res.status(200).json(achievements);
  });
  
  app.get("/api/user/achievements", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const achievements = await storage.getUserAchievements(user.id);
    res.status(200).json(achievements);
  });
  
  // Scholarship routes
  app.get("/api/scholarships", async (req: Request, res: Response) => {
    const scholarships = await storage.getScholarships();
    res.status(200).json(scholarships);
  });
  
  // Chat routes
  app.get("/api/chat/messages", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const messages = await storage.getChatMessages(user.id);
    res.status(200).json(messages);
  });
  
  app.post("/api/chat/messages", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    try {
      const messageSchema = insertChatMessageSchema.parse({
        ...req.body,
        userId: user.id,
        isFromUser: true,
      });
      
      const userMessage = await storage.createChatMessage(messageSchema);
      
      // Get previous messages for context (up to 10)
      const previousMessages = await storage.getChatMessages(user.id);
      const recentMessages = previousMessages.slice(-10);
      
      // Generate AI response using OpenAI
      const aiResponse = await generateAIResponse(messageSchema.message, recentMessages);
      
      // Save AI response
      const botMessage = await storage.createChatMessage({
        userId: user.id,
        message: aiResponse,
        isFromUser: false,
      });
      
      res.status(201).json([userMessage, botMessage]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  // Career recommendations
  app.get("/api/career/recommendations", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const recommendations = await storage.getCareerRecommendations(user.id);
    res.status(200).json(recommendations);
  });
  
  // Generate career recommendations
  app.post("/api/career/generate-recommendations", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    // Check if user has completed enough modules
    const userProgress = await storage.getUserProgress(user.id);
    const completedModules = userProgress.filter(p => p.isCompleted);
    
    if (completedModules.length < 3) {
      return res.status(400).json({ 
        message: "Complete at least 3 modules to get career recommendations" 
      });
    }
    
    try {
      // Generate recommendations based on completed modules
      const recommendations = [
        {
          userId: user.id,
          title: "Software Developer",
          description: "Design, build, and maintain software applications",
          matchScore: 85,
          fieldOfStudy: "Computer Science",
          avgSalary: 110000,
          eduRequirements: "Bachelor's degree in Computer Science or related field"
        },
        {
          userId: user.id,
          title: "UX/UI Designer",
          description: "Create user-friendly interfaces and improve user experience",
          matchScore: 78,
          fieldOfStudy: "Design, Human-Computer Interaction",
          avgSalary: 90000,
          eduRequirements: "Bachelor's degree in Design or related field"
        },
        {
          userId: user.id,
          title: "Data Scientist",
          description: "Analyze data to help organizations make better decisions",
          matchScore: 70,
          fieldOfStudy: "Data Science, Statistics",
          avgSalary: 120000,
          eduRequirements: "Bachelor's or Master's degree in Statistics, Computer Science, or related field"
        }
      ];
      
      const savedRecommendations = [];
      
      for (const rec of recommendations) {
        const savedRec = await storage.createCareerRecommendation(rec);
        savedRecommendations.push(savedRec);
      }
      
      res.status(201).json(savedRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate career recommendations" });
    }
  });
  
  // Referral routes
  app.get("/api/referrals", authMiddleware, async (req: Request, res: Response) => {
    const user = getUser(req, res);
    if (!user) return;
    
    const referrals = await storage.getReferrals(user.id);
    res.status(200).json(referrals);
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
