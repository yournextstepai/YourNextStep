import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AchievementsProps {
  achievements: any[];
  isLoading: boolean;
}

export default function Achievements({ achievements, isLoading }: AchievementsProps) {
  // Sample achievements for the UI when real ones are not loaded yet
  const sampleAchievements = [
    { id: 1, title: "Career Explorer", icon: "medal", color: "primary" },
    { id: 2, title: "Fast Learner", icon: "book", color: "secondary" },
    { id: 3, title: "1K Points", icon: "star", color: "accent" },
    { id: 4, title: "Tech Savvy", icon: "laptop-code", color: "primary" },
    { id: 5, title: "Financial Wizard", icon: "lock", color: "gray" },
    { id: 6, title: "Interview Master", icon: "lock", color: "gray" }
  ];

  // Determine which achievements to show (real or samples)
  const displayAchievements = achievements.length > 0 ? achievements : sampleAchievements;

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Achievements</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Keep completing modules to earn more badges!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 py-3">
        <div className="flex flex-wrap gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
              </div>
            ))
          ) : (
            // Achievement badges
            displayAchievements.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <div className={`w-16 h-16 bg-${achievement.color === 'gray' ? 'gray-200' : `${achievement.color}/20`} rounded-full flex items-center justify-center`}>
                  <i className={`fas fa-${achievement.icon} ${achievement.color === 'gray' ? 'text-gray-400' : `text-${achievement.color}`} text-xl`}></i>
                </div>
                <span className={`text-xs text-center mt-2 ${achievement.color === 'gray' ? 'text-gray-500' : ''}`}>
                  {achievement.title}
                </span>
                {achievement.color === 'gray' && (
                  <span className="text-xs text-gray-500">Locked</span>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
