import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface UserContextType {
  userProgress: any[];
  achievements: any[];
  scholarships: any[];
  isLoading: boolean;
  updateProgress: (moduleId: number, progress: number, isCompleted: boolean) => Promise<void>;
  calculateScholarshipProgress: (scholarshipId: number) => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthContext();
  
  // Fetch user progress
  const { 
    data: userProgress = [], 
    isLoading: isLoadingProgress,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ["/api/user/progress"],
    enabled: isAuthenticated
  });
  
  // Fetch user achievements
  const { 
    data: achievements = [], 
    isLoading: isLoadingAchievements,
    refetch: refetchAchievements
  } = useQuery({
    queryKey: ["/api/user/achievements"],
    enabled: isAuthenticated
  });
  
  // Fetch scholarships
  const { 
    data: scholarships = [], 
    isLoading: isLoadingScholarships
  } = useQuery({
    queryKey: ["/api/scholarships"],
    enabled: isAuthenticated
  });
  
  // Update progress for a module
  const updateProgress = async (moduleId: number, progress: number, isCompleted: boolean) => {
    try {
      await apiRequest("POST", "/api/user/progress", {
        moduleId,
        progress,
        isCompleted
      });
      
      // Refetch data
      await refetchProgress();
      await refetchAchievements();
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  };
  
  // Calculate progress towards a scholarship
  const calculateScholarshipProgress = (scholarshipId: number): number => {
    if (!user || !scholarships.length) return 0;
    
    const scholarship = scholarships.find((s: any) => s.id === scholarshipId);
    if (!scholarship) return 0;
    
    return Math.min(100, Math.round((user.points / scholarship.pointsRequired) * 100));
  };
  
  return (
    <UserContext.Provider
      value={{
        userProgress,
        achievements,
        scholarships,
        isLoading: isLoadingProgress || isLoadingAchievements || isLoadingScholarships,
        updateProgress,
        calculateScholarshipProgress
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
