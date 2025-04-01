import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Star, BookOpen, Award, CheckCircle } from "lucide-react";
import ModuleBot from "@/components/curriculum/ModuleBot";
import { Module, UserProgress } from "@shared/schema";

export default function ModuleDetail() {
  const [activeSection, setActiveSection] = useState("content");
  const [matched, params] = useRoute("/curriculum/:id");
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuthContext();
  const moduleId = params?.id ? parseInt(params.id) : null;

  // Fetch module data
  const { data: module, isLoading: isModuleLoading } = useQuery<Module>({
    queryKey: ["/api/modules", moduleId],
    enabled: !!moduleId,
  });

  // Fetch user progress
  const { data: userProgressList = [], isLoading: isProgressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress"],
    enabled: isAuthenticated,
  });

  // Get this module's progress
  const userProgress = userProgressList.find((p: any) => p.moduleId === moduleId);
  const progress = userProgress?.progress || 0;
  const isCompleted = userProgress?.isCompleted || false;

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { moduleId: number; progress: number; isCompleted: boolean }) =>
      apiRequest("/api/user/progress", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  // Mark progress as user interacts with the module
  const updateProgress = (newProgress: number, completed = false) => {
    if (!isAuthenticated || !moduleId) return;
    
    updateProgressMutation.mutate({
      moduleId,
      progress: newProgress,
      isCompleted: completed,
    });
  };

  // Simulate automatic progress as user stays on the page
  useEffect(() => {
    if (!isAuthenticated || !moduleId || isCompleted) return;
    
    // Start with at least 10% progress when the module is opened
    if (progress < 10) {
      updateProgress(10);
    }
    
    // Increment progress every minute the user stays on the page
    const interval = setInterval(() => {
      // Only update if we're not already completed or at 100%
      if (progress < 100) {
        const newProgress = Math.min(100, progress + 5);
        updateProgress(newProgress, newProgress === 100);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, moduleId, progress, isCompleted]);

  // Handle completing the module manually
  const handleCompleteModule = () => {
    if (!isAuthenticated || !moduleId) return;
    updateProgress(100, true);
  };

  // Return to curriculum page
  const handleBack = () => {
    navigate("/curriculum");
  };

  // Loading state
  if (isModuleLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Module not found
  if (!module) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Module Not Found</h2>
            <p className="mb-6">The module you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack}>Back to Curriculum</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-2 pl-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Curriculum
          </Button>
          <h1 className="text-2xl font-bold">{module.title}</h1>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <Badge variant="outline" className="bg-gray-100">
              <Clock className="mr-1 h-3 w-3" /> {module.duration} min
            </Badge>
            <Badge variant="outline" className="bg-gray-100">
              <Star className="mr-1 h-3 w-3" /> {module.points} points
            </Badge>
            <Badge variant="outline" className="bg-gray-100">
              <BookOpen className="mr-1 h-3 w-3" /> {module.category}
            </Badge>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Module Completed</span>
              </div>
            ) : (
              <div className="w-full md:w-64">
                <p className="text-sm text-gray-500 mb-1">Your Progress: {progress}%</p>
                <Progress value={progress} className="h-2 w-full" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Module Content and Bot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Tabs defaultValue="content" onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-0">
              <TabsContent value="content" className="mt-0">
                <div className="prose max-w-none">
                  <h2>Module Overview</h2>
                  <p>{module.description}</p>
                  
                  <h3>Learning Objectives</h3>
                  <ul>
                    <li>Understand key concepts related to {module.title.toLowerCase()}</li>
                    <li>Develop skills to navigate the career exploration process</li>
                    <li>Apply knowledge to real-world scenarios</li>
                    <li>Create a personalized action plan</li>
                  </ul>
                  
                  <h3>Key Concepts</h3>
                  <p>In this module, you'll learn about various aspects of {module.title.toLowerCase()} including industry trends, required skills, and potential career paths.</p>
                  
                  <div className="bg-gray-100 p-4 rounded-md my-4">
                    <h4 className="text-lg font-medium mb-2">Did You Know?</h4>
                    <p>Students who complete at least 5 career exploration modules are 75% more likely to identify a career path they're passionate about!</p>
                  </div>
                  
                  <h3>Module Content</h3>
                  <p>This is where the main educational content would be displayed, including texts, images, videos, and interactive elements specific to {module.title}.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="exercises" className="mt-0">
                <div className="prose max-w-none">
                  <h2>Practice Exercises</h2>
                  <p>Apply what you've learned with these interactive exercises.</p>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium mb-2">Exercise 1: Reflection</h4>
                      <p>What interests you most about this career field and why?</p>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md mt-2" 
                        rows={3}
                        placeholder="Type your answer here..."
                      ></textarea>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium mb-2">Exercise 2: Skills Assessment</h4>
                      <p>Rate your current skills in the following areas:</p>
                      <div className="space-y-2 mt-2">
                        <div>
                          <label className="block text-sm">Communication</label>
                          <input type="range" min="1" max="5" className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm">Problem Solving</label>
                          <input type="range" min="1" max="5" className="w-full" />
                        </div>
                        <div>
                          <label className="block text-sm">Technical Knowledge</label>
                          <input type="range" min="1" max="5" className="w-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h4 className="font-medium mb-2">Exercise 3: Career Research</h4>
                      <p>Find and list three professionals in this field to potentially connect with:</p>
                      <div className="space-y-2 mt-2">
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Professional #1" />
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Professional #2" />
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Professional #3" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-0">
                <div className="prose max-w-none">
                  <h2>Additional Resources</h2>
                  <p>Explore these materials to deepen your understanding of this topic.</p>
                  
                  <h3>Suggested Reading</h3>
                  <ul>
                    <li><a href="#" className="text-blue-600 hover:underline">Career Guide: Everything You Need to Know About {module.title}</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Industry Trends Report 2024</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Skills Development Framework</a></li>
                  </ul>
                  
                  <h3>Video Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="aspect-video bg-gray-300 rounded-md mb-2"></div>
                      <h4 className="text-sm font-medium">Introduction to {module.title}</h4>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="aspect-video bg-gray-300 rounded-md mb-2"></div>
                      <h4 className="text-sm font-medium">Expert Interview: Career Paths</h4>
                    </div>
                  </div>
                  
                  <h3>Tools and Templates</h3>
                  <ul>
                    <li><a href="#" className="text-blue-600 hover:underline">Career Planning Worksheet</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Skills Assessment Tool</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Goal Setting Template</a></li>
                  </ul>
                </div>
              </TabsContent>
            </CardContent>
            <CardFooter className="flex justify-end">
              {isAuthenticated && !isCompleted && (
                <Button 
                  onClick={handleCompleteModule}
                  disabled={updateProgressMutation.isPending}
                >
                  {updateProgressMutation.isPending ? "Updating..." : "Mark as Completed"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Module Bot Section */}
        <div className="md:col-span-1">
          <ModuleBot moduleId={moduleId} moduleTitle={module.title} />
        </div>
      </div>
    </div>
  );
}