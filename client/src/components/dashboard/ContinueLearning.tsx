import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface ContinueLearningProps {
  modules: any[];
  userProgress: any[];
  isLoading: boolean;
}

export default function ContinueLearning({ modules, userProgress, isLoading }: ContinueLearningProps) {
  // Get progress for a specific module
  const getProgress = (moduleId: number) => {
    const progress = userProgress.find((p) => p.moduleId === moduleId);
    return progress ? progress.progress : 0;
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Continue Learning</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Your current modules in progress
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 pb-5">
        {isLoading ? (
          // Loading skeletons
          <>
            <div className="bg-white border border-gray-200 rounded-md p-4 mb-3">
              <div className="flex justify-between items-center">
                <div className="w-3/4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-md p-4 mb-3">
              <div className="flex justify-between items-center">
                <div className="w-3/4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </>
        ) : modules.length > 0 ? (
          // Module cards
          modules.map((module) => (
            <div key={module.id} className="bg-white border border-gray-200 rounded-md p-4 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{module.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${getProgress(module.id)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{getProgress(module.id)}%</span>
                  </div>
                </div>
                <Link href={`/curriculum/${module.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          // No modules in progress
          <div className="text-center py-8">
            <i className="fas fa-book text-gray-300 text-4xl mb-3"></i>
            <p className="text-gray-500">No modules in progress</p>
            <Link href="/curriculum">
              <Button variant="outline" className="mt-4">
                Start Learning
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
