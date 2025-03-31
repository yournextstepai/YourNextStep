import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TopNav() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an issue logging out",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      <button 
        className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-600"
        onClick={() => setSidebarOpen(true)}
      >
        <i className="fas fa-bars"></i>
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="lg:hidden flex items-center">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="ml-2 text-lg font-bold text-gray-900">Your Next Step</h1>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <div className="mr-3 flex items-center text-sm font-medium text-gray-700">
            <i className="fas fa-star text-accent mr-1"></i>
            <span>{user?.points || 0} points</span>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1 text-gray-400 rounded-full hover:text-gray-500">
                <i className="fas fa-bell"></i>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col space-y-2 p-2">
                <h4 className="font-medium">Notifications</h4>
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="ml-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span className="sr-only">Open user menu</span>
                <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start">
                  <i className="fas fa-user mr-2"></i> Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                  <i className="fas fa-cog mr-2"></i> Settings
                </Button>
                <Button variant="ghost" className="justify-start text-red-500" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt mr-2"></i> Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
