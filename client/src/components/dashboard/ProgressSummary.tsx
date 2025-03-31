import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/contexts/UserContext";

interface ProgressSummaryProps {
  isLoading: boolean;
  progress: number;
  completedModules: number;
  totalModules: number;
  points: number;
}

export default function ProgressSummary({
  isLoading,
  progress,
  completedModules,
  totalModules,
  points
}: ProgressSummaryProps) {
  const { scholarships } = useUserContext();
  
  // Get the first scholarship for progress display
  const mainScholarship = scholarships?.[0];
  const scholarshipProgress = mainScholarship 
    ? Math.min(100, Math.round((points / mainScholarship.pointsRequired) * 100))
    : 0;
  
  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Progress Summary</CardTitle>
          <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
            Keep going to unlock scholarships and career opportunities!
          </CardDescription>
        </div>
        
        <div className="flex items-center">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16" viewBox="0 0 36 36">
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#E5E7EB" 
                strokeWidth="3" 
              />
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="3" 
                strokeDasharray={`${progress}, 100`} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
              {isLoading ? <Skeleton className="h-6 w-10" /> : `${progress}%`}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Modules completed</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? <Skeleton className="h-5 w-20" /> : `${completedModules} of ${totalModules}`}
            </dd>
          </div>
          
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current points</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? <Skeleton className="h-5 w-24" /> : `${points} points`}
            </dd>
          </div>
          
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Scholarship eligibility</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                  <Skeleton className="h-4 w-40 mt-1" />
                </>
              ) : (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-accent h-2.5 rounded-full" 
                      style={{ width: `${scholarshipProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {points} / {mainScholarship?.pointsRequired || 10000} points needed
                  </span>
                </>
              )}
            </dd>
          </div>
          
          <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Latest achievement</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <div className="flex items-center">
                  <i className="fas fa-medal text-accent mr-2"></i>
                  <span>
                    {completedModules > 0 ? "Career Research Specialist" : "None yet"}
                  </span>
                </div>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
