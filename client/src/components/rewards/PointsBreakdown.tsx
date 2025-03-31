import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PointsBreakdownProps {
  points: number;
  isLoading: boolean;
}

export default function PointsBreakdown({ points, isLoading }: PointsBreakdownProps) {
  // Points categories
  const pointsBreakdown = [
    { category: "Module completion", points: Math.round(points * 0.65) },
    { category: "Daily login streaks", points: Math.round(points * 0.12) },
    { category: "Assessments completed", points: Math.round(points * 0.14) },
    { category: "Consistent engagement", points: Math.round(points * 0.09) }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Points Breakdown</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Total points: {isLoading ? <Skeleton className="h-4 w-16 inline-block" /> : points}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200">
        <dl>
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, index) => (
              <div key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 mt-1 sm:mt-0" />
              </div>
            ))
          ) : (
            // Points breakdown
            pointsBreakdown.map((item, index) => (
              <div key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500">{item.category}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{item.points} points</dd>
              </div>
            ))
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
