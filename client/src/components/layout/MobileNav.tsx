import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/dashboard", label: "Home", icon: "home" },
    { path: "/curriculum", label: "Learn", icon: "book" },
    { path: "/chatbot", label: "Ara", icon: "comment-dots" },
    { path: "/rewards", label: "Rewards", icon: "trophy" },
    { path: "/profile", label: "Profile", icon: "user" },
  ];
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around px-2 py-3">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={cn(
              "flex flex-col items-center",
              location === item.path ? "text-primary" : "text-gray-500"
            )}>
              <i className={`fas fa-${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
