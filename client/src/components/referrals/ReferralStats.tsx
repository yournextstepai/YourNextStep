import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralStatsProps {
  referrals: any[];
  isLoading: boolean;
}

export default function ReferralStats({ referrals, isLoading }: ReferralStatsProps) {
  // Calculate total points earned from referrals
  const totalPoints = referrals.length * 500;
  
  return (
    <Card className="mb-6">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Referral Stats</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
          Track your referral performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-primary/20 rounded-full p-2 mr-3">
                <i className="fas fa-users text-primary"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Referrals</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-semibold text-gray-900">{referrals.length}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-accent/20 rounded-full p-2 mr-3">
                <i className="fas fa-star text-accent"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points Earned</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-semibold text-gray-900">{totalPoints}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="bg-secondary/20 rounded-full p-2 mr-3">
                <i className="fas fa-trophy text-secondary"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referral Rank</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-semibold text-gray-900">
                    {referrals.length > 5 ? "Gold" : referrals.length > 2 ? "Silver" : "Bronze"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
