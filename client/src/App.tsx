import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Curriculum from "@/pages/Curriculum";
import Chatbot from "@/pages/Chatbot";
import Rewards from "@/pages/Rewards";
import Referrals from "@/pages/Referrals";
import CareerMatches from "@/pages/CareerMatches";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { useAuth } from "./lib/auth";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import TopNav from "./components/layout/TopNav";

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <>{children}</>;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden pb-16 lg:pb-0">
        <TopNav />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/curriculum" component={Curriculum} />
      <Route path="/chatbot" component={Chatbot} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/career" component={CareerMatches} />
      <Route path="/profile" component={Profile} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
          <Toaster />
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
