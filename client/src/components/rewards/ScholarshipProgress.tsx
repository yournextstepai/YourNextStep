import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ScholarshipProgressProps {
  scholarships: any[];
  userPoints: number;
  isLoading: boolean;
}

export default function ScholarshipProgress({
  scholarships,
  userPoints,
  isLoading
}: ScholarshipProgressProps) {
  // Calculate progress percentage for a scholarship
  const calculateProgress = (pointsRequired: number) => {
    return Math.min(100, Math.round((userPoints / pointsRequired) * 100));
  };
  
  // Sample scholarships for UI display when real ones are not loaded
  const sampleScholarships = [
    {
      id: 1,
      title: "Future Leaders Scholarship",
      description: "Complete 5 more modules to qualify for this $1,000 scholarship",
      pointsRequired: 10000
    },
    {
      id: 2,
      title: "Career Readiness Scholarship",
      description: "Complete the \"Career Readiness\" path to qualify for this $500 scholarship",
      pointsRequired: 5000
    },
    {
      id: 3,
      title: "Tech Innovator Scholarship",
      description: "Complete the \"Tech Skills\" path to qualify for this $750 scholarship",
      pointsRequired: 8000
    }
  ];
  
  // Determine which scholarships to show (real or samples)
  const displayScholarships = scholarships.length > 0 ? scholarships : sampleScholarships;

  return (
    <Card className="mb-6">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Scholarship Progress</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Keep earning points to qualify for scholarships
        </CardDescription>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200 px-4 py-5">
        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </div>
            ))
          ) : (
            // Scholarship progress bars
            displayScholarships.map((scholarship) => {
              const progress = calculateProgress(scholarship.pointsRequired);
              
              return (
                <div key={scholarship.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-gray-900">{scholarship.title}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {userPoints} / {scholarship.pointsRequired} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-accent h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{scholarship.description}</p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
