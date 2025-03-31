import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface ReferralCardProps {
  referral: any;
}

export default function ReferralCard({ referral }: ReferralCardProps) {
  // Fetch referred user details
  const { data: referredUser } = useQuery({
    queryKey: [`/api/users/${referral.referredUserId}`],
    enabled: !!referral.referredUserId
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {referredUser?.avatarUrl ? (
            <img
              className="h-10 w-10 rounded-full"
              src={referredUser.avatarUrl}
              alt={`${referredUser.firstName} ${referredUser.lastName}`}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {referredUser?.firstName?.charAt(0) || "U"}
            </div>
          )}
          
          <div className="ml-4">
            <h4 className="font-medium text-gray-900">
              {referredUser ? `${referredUser.firstName} ${referredUser.lastName}` : "User"}
            </h4>
            <p className="text-xs text-gray-500">
              Joined {formatDate(referral.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="text-sm font-medium text-accent">
          <i className="fas fa-star mr-1"></i>
          500 points
        </div>
      </div>
    </div>
  );
}
