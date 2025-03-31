import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useUserContext } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ModuleCard from "@/components/curriculum/ModuleCard";

export default function Curriculum() {
  const [activeCategory, setActiveCategory] = useState("All Modules");
  const { userProgress } = useUserContext();
  
  // Fetch modules
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["/api/modules"],
  });
  
  // All possible categories
  const categories = ["All Modules", "Career Exploration", "Skill Building", "College Prep", "Financial Literacy"];
  
  // Filter modules by category
  const filteredModules = activeCategory === "All Modules"
    ? modules
    : modules.filter((module: any) => module.category === activeCategory);
  
  // Calculate progress
  const completedModules = userProgress.filter((p: any) => p.isCompleted).length;
  const totalModules = modules.length;
  const overallProgress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Curriculum</h1>
        <p className="mt-2 text-sm text-gray-700">Complete modules to earn points and unlock scholarships</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Progress Bar */}
        <Card className="mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Curriculum Progress</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isLoading 
                ? <Skeleton className="h-5 w-32" /> 
                : `${completedModules} of ${totalModules} modules completed`
              }
            </p>
            {isLoading ? (
              <Skeleton className="h-2.5 w-full mt-3 rounded-full" />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Module Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={activeCategory === category ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))
          ) : filteredModules.length > 0 ? (
            // Module cards
            filteredModules.map((module: any) => (
              <ModuleCard 
                key={module.id}
                module={module}
                userProgress={userProgress.find((p: any) => p.moduleId === module.id)}
              />
            ))
          ) : (
            // No modules found
            <div className="col-span-full text-center py-12">
              <i className="fas fa-book text-gray-300 text-4xl mb-3"></i>
              <p className="text-gray-500">No modules found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
