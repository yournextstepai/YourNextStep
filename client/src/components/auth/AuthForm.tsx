import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  grade: z.coerce.number()
    .min(9, "Grade must be between 9 and 12")
    .max(12, "Grade must be between 9 and 12"),
  referralCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  loading: boolean;
  referralCode?: string | null;
}

export default function AuthForm({ type, onSubmit, loading, referralCode }: AuthFormProps) {
  // Use the appropriate schema based on form type
  const schema = type === 'login' ? loginSchema : registerSchema;
  
  // Initialize the form
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: type === 'login' 
      ? { username: '', password: '' } 
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          grade: 9,
          referralCode: referralCode || ''
        }
  });
  
  // Handle form submission
  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {type === 'register' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                type="text"
                autoComplete="given-name"
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.firstName.message as string}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName"
                type="text"
                autoComplete="family-name"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.lastName.message as string}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message as string}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="grade">Grade</Label>
            <select
              id="grade"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              {...form.register("grade")}
            >
              <option value="9">9th Grade</option>
              <option value="10">10th Grade</option>
              <option value="11">11th Grade</option>
              <option value="12">12th Grade</option>
            </select>
            {form.formState.errors.grade && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.grade.message as string}</p>
            )}
          </div>
        </>
      )}
      
      <div>
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username"
          type="text"
          autoComplete="username"
          {...form.register("username")}
        />
        {form.formState.errors.username && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          type="password"
          autoComplete={type === 'login' ? "current-password" : "new-password"}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message as string}</p>
        )}
      </div>
      
      {type === 'register' && (
        <>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message as string}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="referralCode">Referral Code (optional)</Label>
            <Input 
              id="referralCode"
              type="text"
              placeholder="Enter referral code if you have one"
              {...form.register("referralCode")}
            />
          </div>
        </>
      )}
      
      {type === 'login' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              Forgot your password?
            </a>
          </div>
        </div>
      )}

      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              {type === 'login' ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            type === 'login' ? "Sign in" : "Register"
          )}
        </Button>
      </div>
    </form>
  );
}
