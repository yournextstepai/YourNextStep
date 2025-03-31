import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface BadgesDisplayProps {
  isLoading: boolean;
}

export default function BadgesDisplay({ isLoading }: BadgesDisplayProps) {
  // Fetch achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/user/achievements"],
    enabled: !isLoading
  });
  
  // Sample badges for UI display
  const sampleBadges = [
    { id: 1, title: "Career Explorer", icon: "medal", color: "primary", points: 250 },
    { id: 2, title: "Fast Learner", icon: "book", color: "secondary", points: 300 },
    { id: 3, title: "1K Points", icon: "star", color: "accent", points: 100 },
    { id: 4, title: "Tech Savvy", icon: "laptop-code", color: "primary", points: 200 },
    { id: 5, title: "Financial Wizard", icon: "lock", color: "gray", points: 0 },
    { id: 6, title: "Interview Master", icon: "lock", color: "gray", points: 0 }
  ];
  
  // Determine which badges to show (real or samples)
  const displayBadges = achievements.length > 0 ? achievements : sampleBadges;

  return (
    <Card className="mb-6">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Badges</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Achievements you've unlocked
        </CardDescription>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200 px-4 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-4 w-20 mt-2" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            ))
          ) : (
            // Badge items
            displayBadges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className={`w-20 h-20 bg-${badge.color === 'gray' ? 'gray-200' : `${badge.color}/20`} rounded-full flex items-center justify-center`}>
                  <i className={`fas fa-${badge.icon} ${badge.color === 'gray' ? 'text-gray-400' : `text-${badge.color}`} text-2xl`}></i>
                </div>
                <span className={`text-sm text-center mt-2 ${badge.color === 'gray' ? 'text-gray-500' : ''}`}>
                  {badge.title}
                </span>
                <span className="text-xs text-gray-500">
                  {badge.color === 'gray' ? 'Locked' : `${badge.points} points`}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
