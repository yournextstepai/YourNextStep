import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "home" },
    { path: "/curriculum", label: "Curriculum", icon: "book" },
    { path: "/chatbot", label: "Ara Chatbot", icon: "comment-dots" },
    { path: "/community", label: "Community", icon: "users" },
    { path: "/rewards", label: "Rewards & Scholarships", icon: "trophy" },
    { path: "/referrals", label: "Referrals", icon: "share-alt" },
    { path: "/career", label: "Career Matches", icon: "briefcase" },
  ];
  
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-gray-900">Your Next Step</h1>
          </div>
          
          <div className="mt-8 px-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a className={cn(
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                  location === item.path
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  <i className={cn(
                    `fas fa-${item.icon} mr-3 text-lg`,
                    location === item.path ? "text-white" : "text-gray-500"
                  )}></i>
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <Link href="/profile">
            <a className="flex-shrink-0 group block w-full">
              <div className="flex items-center">
                <div>
                  {user?.avatarUrl ? (
                    <img
                      className="inline-block h-10 w-10 rounded-full"
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    View profile
                  </p>
                </div>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
