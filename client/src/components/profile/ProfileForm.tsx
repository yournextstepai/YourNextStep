import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  grade: z.coerce.number()
    .min(9, "Grade must be between 9 and 12")
    .max(12, "Grade must be between 9 and 12"),
  bio: z.string().optional(),
  avatarUrl: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      grade: user?.grade || 9,
      bio: "",
      avatarUrl: user?.avatarUrl || ""
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div>
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div>
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }
  
  const onSubmit = (data: ProfileFormValues) => {
    console.log(data);
    
    // Here you would update the user profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...form.register("firstName")}
          />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...form.register("lastName")}
          />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="grade">Grade</Label>
        <select
          id="grade"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          {...form.register("grade")}
        >
          <option value="9">9th Grade</option>
          <option value="10">10th Grade</option>
          <option value="11">11th Grade</option>
          <option value="12">12th Grade</option>
        </select>
        {form.formState.errors.grade && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.grade.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="bio">About Me</Label>
        <textarea
          id="bio"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          rows={4}
          placeholder="Tell us a little about yourself..."
          {...form.register("bio")}
        ></textarea>
      </div>
      
      <div>
        <Label htmlFor="avatarUrl">Profile Picture URL</Label>
        <Input
          id="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          {...form.register("avatarUrl")}
        />
      </div>
      
      <Button type="submit" className="bg-primary hover:bg-primary/90">
        Save Changes
      </Button>
    </form>
  );
}
