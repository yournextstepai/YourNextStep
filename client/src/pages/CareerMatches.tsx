import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CareerCard from "@/components/career/CareerCard";
import GenerateButton from "@/components/career/GenerateButton";
import { CareerRecommendation } from "@shared/schema";

export default function CareerMatches() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch career recommendations
  const { data: recommendations = [], isLoading } = useQuery<CareerRecommendation[]>({
    queryKey: ["/api/career/recommendations"],
  });
  
  // Generate recommendations mutation
  const { mutate: generateRecommendations, isPending } = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("/api/career/generate-recommendations", "POST", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/career/recommendations"] });
      toast({
        title: "Recommendations generated",
        description: "Your career matches are ready to view",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Complete more modules to generate recommendations",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  });
  
  // Generate recommendations
  const handleGenerateRecommendations = () => {
    generateRecommendations();
  };
  
  // Check if there are existing recommendations
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Career Matches</h1>
        <p className="mt-2 text-sm text-gray-700">Discover career paths that match your interests and skills</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {!hasRecommendations && !isLoading ? (
          // No recommendations yet
          <GenerateButton 
            onGenerate={handleGenerateRecommendations} 
            isPending={isPending} 
          />
        ) : (
          <>
            {/* Recommendations Header */}
            <Card className="mb-6">
              <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Career Matches</CardTitle>
                  <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
                    Based on your completed modules and interests
                  </CardDescription>
                </div>
                
                {/* Regenerate button */}
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-sync-alt mr-2"></i>
                  )}
                  Regenerate
                </button>
              </CardHeader>
            </Card>
            
            {/* Career Match Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading || isGenerating ? (
                // Loading skeletons
                Array(3).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-16 ml-2" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : recommendations.length > 0 ? (
                // Recommendation cards
                recommendations.map((career) => (
                  <CareerCard key={career.id} career={career} />
                ))
              ) : (
                // Empty state (though this should not be reached due to the conditional at the top)
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-briefcase text-gray-300 text-4xl mb-3"></i>
                  <p className="text-gray-500">No career matches found</p>
                  <p className="text-sm text-gray-400 mt-1">Complete more modules to generate recommendations</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Career Exploration Tips */}
        <Card className="mt-8">
          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">Career Exploration Tips</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
              Make the most of your career matches
            </CardDescription>
          </CardHeader>
          
          <CardContent className="border-t border-gray-200 px-4 py-5">
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <i className="fas fa-search"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Research Each Career</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Take time to learn about the day-to-day responsibilities, work environment, and growth opportunities for each career match.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <i className="fas fa-user-friends"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Talk to Professionals</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Connect with people already working in these fields through informational interviews or job shadowing opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <i className="fas fa-chart-line"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Explore Growth Trends</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Research which careers are growing and where job opportunities are expected to increase over the next decade.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Plan Your Education</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Determine what education or training is required for each career and research schools or programs that can prepare you.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
