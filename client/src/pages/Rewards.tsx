import { useAuth } from "@/lib/auth";
import { useUserContext } from "@/contexts/UserContext";
import ScholarshipProgress from "@/components/rewards/ScholarshipProgress";
import PointsBreakdown from "@/components/rewards/PointsBreakdown";
import BadgesDisplay from "@/components/rewards/BadgesDisplay";

export default function Rewards() {
  const { user } = useAuth();
  const { scholarships, isLoading } = useUserContext();
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Rewards & Scholarships</h1>
        <p className="mt-2 text-sm text-gray-700">Track your progress toward earning rewards and scholarships</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Scholarship Progress */}
        <ScholarshipProgress 
          scholarships={scholarships} 
          userPoints={user?.points || 0}
          isLoading={isLoading} 
        />
        
        {/* Points Breakdown */}
        <PointsBreakdown 
          points={user?.points || 0}
          isLoading={isLoading} 
        />
        
        {/* Badges */}
        <BadgesDisplay isLoading={isLoading} />
      </div>
    </div>
  );
}
