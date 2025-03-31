import { useAuth } from "@/lib/auth";
import { useUserContext } from "@/contexts/UserContext";
import ProgressSummary from "@/components/dashboard/ProgressSummary";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import QuickChat from "@/components/dashboard/QuickChat";
import Achievements from "@/components/dashboard/Achievements";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();
  const { userProgress, achievements, isLoading } = useUserContext();
  
  // Fetch modules
  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ["/api/modules"],
  });
  
  // Get modules in progress
  const modulesInProgress = isLoading ? [] : modules
    .filter((module: any) => {
      const progress = userProgress.find((p: any) => p.moduleId === module.id);
      return progress && progress.progress > 0 && progress.progress < 100;
    })
    .sort((a: any, b: any) => {
      const progressA = userProgress.find((p: any) => p.moduleId === a.id)?.progress || 0;
      const progressB = userProgress.find((p: any) => p.moduleId === b.id)?.progress || 0;
      return progressB - progressA; // Show highest progress first
    })
    .slice(0, 3); // Take top 3
  
  // Calculate overall progress
  const completedModules = userProgress.filter((p: any) => p.isCompleted).length;
  const totalModules = modules.length;
  const overallProgress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            `Welcome back, ${user?.firstName || 'Student'}!`
          )}
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Progress Summary */}
          <ProgressSummary 
            isLoading={isLoading}
            progress={overallProgress}
            completedModules={completedModules}
            totalModules={totalModules}
            points={user?.points || 0}
          />
          
          {/* Recent Activity & Upcoming */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Continue Learning */}
            <div className="md:col-span-2">
              <ContinueLearning 
                modules={modulesInProgress}
                userProgress={userProgress}
                isLoading={isLoading || isLoadingModules}
              />
            </div>
            
            {/* Quick Chat */}
            <div>
              <QuickChat />
            </div>
          </div>
          
          {/* Achievements */}
          <div className="mt-6">
            <Achievements 
              achievements={achievements}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
