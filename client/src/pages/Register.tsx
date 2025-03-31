import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Extract referral code from URL if present
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      toast({
        title: "Referral detected",
        description: `You were referred by code: ${ref}`,
      });
    }
  }, [location, toast]);

  const handleRegister = async (data: any) => {
    setLoading(true);
    
    // Add referral code if present
    if (referralCode) {
      data.referralCode = referralCode;
    }
    
    const success = await register(data);
    setLoading(false);
    
    if (success) {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Your Next Step and discover your career path
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {referralCode && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <i className="fas fa-user-plus mr-2"></i>
                You were referred by code: <strong>{referralCode}</strong>
              </p>
            </div>
          )}
          
          <AuthForm
            type="register"
            onSubmit={handleRegister}
            loading={loading}
            referralCode={referralCode}
          />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login">
                <a className="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50">
                  Sign in instead
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
