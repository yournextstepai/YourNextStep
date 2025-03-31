import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ReferralCard from "@/components/referrals/ReferralCard";
import ReferralStats from "@/components/referrals/ReferralStats";

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Fetch referrals
  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["/api/referrals"],
    enabled: !!user
  });
  
  const referralUrl = `${window.location.origin}/register?ref=${user?.referralCode}`;
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => {
      toast({
        title: "Copy failed",
        description: "Failed to copy referral link",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Referrals</h1>
        <p className="mt-2 text-sm text-gray-700">Invite friends to join Your Next Step and earn rewards</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Referral Link */}
        <Card className="mb-6">
          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Referral Link</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
              Share this link with friends and earn 500 points for each successful referral
            </CardDescription>
          </CardHeader>
          
          <CardContent className="border-t border-gray-200 px-4 py-5">
            <div className="flex flex-col md:flex-row gap-3">
              <Input 
                className="flex-1" 
                value={referralUrl} 
                readOnly
              />
              <Button 
                onClick={copyReferralCode}
                className="bg-primary hover:bg-primary/90"
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i>
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Your personal referral code: <span className="font-medium">{user?.referralCode}</span>
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" className="text-blue-600">
                <i className="fab fa-facebook mr-2"></i>
                Share on Facebook
              </Button>
              <Button variant="outline" className="text-sky-500">
                <i className="fab fa-twitter mr-2"></i>
                Share on Twitter
              </Button>
              <Button variant="outline" className="text-green-600">
                <i className="fab fa-whatsapp mr-2"></i>
                Share on WhatsApp
              </Button>
              <Button variant="outline" className="text-blue-500">
                <i className="fas fa-envelope mr-2"></i>
                Share via Email
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Referral Stats */}
        <ReferralStats referrals={referrals} isLoading={isLoading} />
        
        {/* Recent Referrals */}
        <Card className="mb-6">
          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">Your Referrals</CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
              People who joined using your referral link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="border-t border-gray-200">
            {isLoading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))
            ) : referrals.length > 0 ? (
              // Referral items
              referrals.map((referral: any) => (
                <ReferralCard key={referral.id} referral={referral} />
              ))
            ) : (
              // Empty state
              <div className="text-center py-8">
                <i className="fas fa-share-alt text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">You haven't referred anyone yet</p>
                <p className="text-sm text-gray-400 mt-1">Share your referral link to start earning points!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* How Referrals Work */}
        <Card className="mb-6">
          <CardHeader className="px-4 py-5 sm:px-6">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">How Referrals Work</CardTitle>
          </CardHeader>
          
          <CardContent className="border-t border-gray-200 px-4 py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-share-alt text-primary"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">1. Share Your Link</h3>
                <p className="text-sm text-gray-500">Send your referral link to friends and classmates</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-plus text-primary"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">2. Friends Join</h3>
                <p className="text-sm text-gray-500">When they register using your link, they become your referrals</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-gift text-primary"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">3. Earn Rewards</h3>
                <p className="text-sm text-gray-500">Get 500 points for each successful referral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
