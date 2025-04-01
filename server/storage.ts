import { 
  User, InsertUser,
  Module, InsertModule,
  UserProgress, InsertUserProgress,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  Scholarship, InsertScholarship,
  ChatMessage, InsertChatMessage,
  CareerRecommendation, InsertCareerRecommendation,
  Session, InsertSession,
  Referral, InsertReferral,
  CommunityPost, InsertCommunityPost,
  CommunityComment, InsertCommunityComment,
  PostLike, InsertPostLike
} from "@shared/schema";
import { randomBytes } from "crypto";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;

  // Sessions
  createSession(userId: number): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;

  // Modules
  getModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  getModulesByCategory(category: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;

  // User Progress
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByModule(userId: number, moduleId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, moduleId: number, progress: number): Promise<UserProgress | undefined>;
  completeModule(userId: number, moduleId: number): Promise<UserProgress | undefined>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Scholarships
  getScholarships(): Promise<Scholarship[]>;
  getScholarship(id: number): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;

  // Chat Messages
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Career Recommendations
  getCareerRecommendations(userId: number): Promise<CareerRecommendation[]>;
  createCareerRecommendation(recommendation: InsertCareerRecommendation): Promise<CareerRecommendation>;

  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferrals(userId: number): Promise<Referral[]>;

  // Community Posts
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPostsByUser(userId: number): Promise<CommunityPost[]>;
  getCommunityPostsByModule(moduleId: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPostLikeCount(postId: number, incrementBy: number): Promise<CommunityPost | undefined>;

  // Community Comments
  getCommunityComments(postId: number): Promise<CommunityComment[]>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;

  // Post Likes
  getPostLike(postId: number, userId: number): Promise<PostLike | undefined>;
  createPostLike(like: InsertPostLike): Promise<PostLike>;
  deletePostLike(postId: number, userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, Module>;
  private userProgress: Map<string, UserProgress>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<string, UserAchievement>;
  private scholarships: Map<number, Scholarship>;
  private chatMessages: Map<number, ChatMessage>;
  private careerRecommendations: Map<number, CareerRecommendation>;
  private sessions: Map<string, Session>;
  private referrals: Map<number, Referral>;
  private communityPosts: Map<number, CommunityPost>;
  private communityComments: Map<number, CommunityComment>;
  private postLikes: Map<string, PostLike>;

  private currentUserId: number;
  private currentModuleId: number;
  private currentUserProgressId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentScholarshipId: number;
  private currentChatMessageId: number;
  private currentCareerRecommendationId: number;
  private currentSessionId: number;
  private currentReferralId: number;
  private currentCommunityPostId: number;
  private currentCommunityCommentId: number;
  private currentPostLikeId: number;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.scholarships = new Map();
    this.chatMessages = new Map();
    this.careerRecommendations = new Map();
    this.sessions = new Map();
    this.referrals = new Map();
    this.communityPosts = new Map();
    this.communityComments = new Map();
    this.postLikes = new Map();

    this.currentUserId = 1;
    this.currentModuleId = 1;
    this.currentUserProgressId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentScholarshipId = 1;
    this.currentChatMessageId = 1;
    this.currentCareerRecommendationId = 1;
    this.currentSessionId = 1;
    this.currentReferralId = 1;
    this.currentCommunityPostId = 1;
    this.currentCommunityCommentId = 1;
    this.currentPostLikeId = 1;

    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample modules
    const moduleData: InsertModule[] = [
      {
        title: "Career Exploration Fundamentals",
        description: "Learn to identify your interests and potential career paths.",
        category: "Career Exploration",
        imageUrl: "https://images.unsplash.com/photo-1603468620905-8de7d86b781e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1055&q=80",
        duration: 45,
        points: 250,
        order: 1,
        isActive: true
      },
      {
        title: "Resume Building Fundamentals",
        description: "Create a standout resume that highlights your strengths.",
        category: "Skill Building",
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        duration: 60,
        points: 300,
        order: 2,
        isActive: true
      },
      {
        title: "Interview Skills Mastery",
        description: "Prepare for successful interviews with confidence.",
        category: "Skill Building",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
        duration: 90,
        points: 400,
        order: 3,
        isActive: true
      }
    ];

    moduleData.forEach(module => {
      this.createModule(module);
    });

    // Create sample achievements
    const achievementData: InsertAchievement[] = [
      {
        title: "Career Explorer",
        description: "Complete the Career Exploration module",
        icon: "medal",
        points: 250,
        requirement: "Complete Career Exploration Fundamentals module"
      },
      {
        title: "Fast Learner",
        description: "Complete a module in under 30 minutes",
        icon: "book",
        points: 300,
        requirement: "Complete any module in less than 30 minutes"
      },
      {
        title: "1K Points",
        description: "Earn 1,000 points on the platform",
        icon: "star",
        points: 100,
        requirement: "Reach 1,000 total points"
      },
      {
        title: "Tech Savvy",
        description: "Complete technology-related modules",
        icon: "laptop-code",
        points: 200,
        requirement: "Complete two technology-related modules"
      }
    ];

    achievementData.forEach(achievement => {
      this.createAchievement(achievement);
    });

    // Create sample scholarships
    const scholarshipData: InsertScholarship[] = [
      {
        title: "Future Leaders Scholarship",
        description: "Complete most modules to qualify for this scholarship",
        amount: 1000,
        pointsRequired: 10000,
        isActive: true
      },
      {
        title: "Career Readiness Scholarship",
        description: "Complete the Career Readiness path to qualify",
        amount: 500,
        pointsRequired: 5000,
        isActive: true
      },
      {
        title: "Tech Innovator Scholarship",
        description: "Complete the Tech Skills path to qualify",
        amount: 750,
        pointsRequired: 8000,
        isActive: true
      }
    ];

    scholarshipData.forEach(scholarship => {
      this.createScholarship(scholarship);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();
    
    const user: User = {
      ...insertUser,
      id,
      points: 0,
      referralCode,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      points: user.points + points
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Sessions
  async createSession(userId: number): Promise<Session> {
    const id = this.currentSessionId++;
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const session: Session = {
      id,
      userId,
      token,
      expiresAt,
      createdAt: new Date()
    };
    
    this.sessions.set(token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const session = this.sessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return undefined;
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  // Modules
  async getModules(): Promise<Module[]> {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getModulesByCategory(category: string): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.category === category)
      .sort((a, b) => a.order - b.order);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    
    const module: Module = {
      ...insertModule,
      id
    };
    
    this.modules.set(id, module);
    return module;
  }

  // User Progress
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserProgressByModule(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    const key = `${userId}-${moduleId}`;
    return this.userProgress.get(key);
  }

  async createUserProgress(insertUserProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const key = `${insertUserProgress.userId}-${insertUserProgress.moduleId}`;
    
    const userProgress: UserProgress = {
      ...insertUserProgress,
      id,
      lastAccessedAt: new Date()
    };
    
    this.userProgress.set(key, userProgress);
    return userProgress;
  }

  async updateUserProgress(userId: number, moduleId: number, progress: number): Promise<UserProgress | undefined> {
    const key = `${userId}-${moduleId}`;
    const userProgress = this.userProgress.get(key);
    
    if (!userProgress) {
      return await this.createUserProgress({
        userId,
        moduleId,
        progress,
        isCompleted: progress === 100
      });
    }
    
    const updatedUserProgress: UserProgress = {
      ...userProgress,
      progress,
      isCompleted: progress === 100,
      completedAt: progress === 100 ? new Date() : userProgress.completedAt,
      lastAccessedAt: new Date()
    };
    
    this.userProgress.set(key, updatedUserProgress);
    return updatedUserProgress;
  }

  async completeModule(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    return this.updateUserProgress(userId, moduleId, 100);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    const userAchievementIds = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .map(ua => ua.achievementId);
    
    return Array.from(this.achievements.values())
      .filter(achievement => userAchievementIds.includes(achievement.id));
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const key = `${userId}-${achievementId}`;
    
    // Check if already unlocked
    if (this.userAchievements.has(key)) {
      return this.userAchievements.get(key);
    }
    
    const achievement = await this.achievements.get(achievementId);
    if (!achievement) return undefined;
    
    const id = this.currentUserAchievementId++;
    
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: new Date()
    };
    
    this.userAchievements.set(key, userAchievement);
    
    // Update user points
    await this.updateUserPoints(userId, achievement.points);
    
    return userAchievement;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    
    const achievement: Achievement = {
      ...insertAchievement,
      id
    };
    
    this.achievements.set(id, achievement);
    return achievement;
  }

  // Scholarships
  async getScholarships(): Promise<Scholarship[]> {
    return Array.from(this.scholarships.values());
  }

  async getScholarship(id: number): Promise<Scholarship | undefined> {
    return this.scholarships.get(id);
  }

  async createScholarship(insertScholarship: InsertScholarship): Promise<Scholarship> {
    const id = this.currentScholarshipId++;
    
    const scholarship: Scholarship = {
      ...insertScholarship,
      id
    };
    
    this.scholarships.set(id, scholarship);
    return scholarship;
  }

  // Chat Messages
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    
    const chatMessage: ChatMessage = {
      ...insertChatMessage,
      id,
      createdAt: new Date()
    };
    
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  // Career Recommendations
  async getCareerRecommendations(userId: number): Promise<CareerRecommendation[]> {
    return Array.from(this.careerRecommendations.values())
      .filter(recommendation => recommendation.userId === userId);
  }

  async createCareerRecommendation(insertCareerRecommendation: InsertCareerRecommendation): Promise<CareerRecommendation> {
    const id = this.currentCareerRecommendationId++;
    
    const careerRecommendation: CareerRecommendation = {
      ...insertCareerRecommendation,
      id,
      createdAt: new Date()
    };
    
    this.careerRecommendations.set(id, careerRecommendation);
    return careerRecommendation;
  }

  // Referrals
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.currentReferralId++;
    
    const referral: Referral = {
      ...insertReferral,
      id,
      createdAt: new Date()
    };
    
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.referrerUserId === userId);
  }

  // Community Posts
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommunityPostsByUser(userId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommunityPostsByModule(moduleId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter(post => post.moduleId === moduleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async createCommunityPost(insertCommunityPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentCommunityPostId++;
    const now = new Date();
    
    const communityPost: CommunityPost = {
      ...insertCommunityPost,
      id,
      likesCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.communityPosts.set(id, communityPost);
    return communityPost;
  }

  async updateCommunityPostLikeCount(postId: number, incrementBy: number): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(postId);
    if (!post) return undefined;
    
    const updatedPost: CommunityPost = {
      ...post,
      likesCount: post.likesCount + incrementBy,
      updatedAt: new Date()
    };
    
    this.communityPosts.set(postId, updatedPost);
    return updatedPost;
  }

  // Community Comments
  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    return Array.from(this.communityComments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createCommunityComment(insertCommunityComment: InsertCommunityComment): Promise<CommunityComment> {
    const id = this.currentCommunityCommentId++;
    const now = new Date();
    
    const communityComment: CommunityComment = {
      ...insertCommunityComment,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.communityComments.set(id, communityComment);
    return communityComment;
  }

  // Post Likes
  async getPostLike(postId: number, userId: number): Promise<PostLike | undefined> {
    const key = `${postId}-${userId}`;
    return this.postLikes.get(key);
  }

  async createPostLike(insertPostLike: InsertPostLike): Promise<PostLike> {
    const id = this.currentPostLikeId++;
    const key = `${insertPostLike.postId}-${insertPostLike.userId}`;
    
    const postLike: PostLike = {
      ...insertPostLike,
      id,
      createdAt: new Date()
    };
    
    this.postLikes.set(key, postLike);
    
    // Update post like count
    await this.updateCommunityPostLikeCount(insertPostLike.postId, 1);
    
    return postLike;
  }

  async deletePostLike(postId: number, userId: number): Promise<void> {
    const key = `${postId}-${userId}`;
    const exists = this.postLikes.has(key);
    
    if (exists) {
      this.postLikes.delete(key);
      
      // Update post like count
      await this.updateCommunityPostLikeCount(postId, -1);
    }
  }
}

export const storage = new MemStorage();
