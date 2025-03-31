import { useAuthContext } from "../contexts/AuthContext";

export function useAuth() {
  const auth = useAuthContext();
  
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    login: auth.login,
    register: auth.register,
    logout: auth.logout
  };
}
