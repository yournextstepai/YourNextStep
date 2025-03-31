import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";

interface ModuleCardProps {
  module: any;
  userProgress?: any;
}

export default function ModuleCard({ module, userProgress }: ModuleCardProps) {
  const progress = userProgress?.progress || 0;
  const isCompleted = userProgress?.isCompleted || false;
  const isInProgress = progress > 0 && !isCompleted;
  const isLocked = module.order > 1 && !userProgress;
  
  let statusComponent;
  if (isCompleted) {
    statusComponent = (
      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        Completed
      </div>
    );
  } else if (isInProgress) {
    statusComponent = (
      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
        In Progress
      </div>
    );
  } else if (isLocked) {
    statusComponent = (
      <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
        Locked
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={module.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80`}
          alt={module.title}
        />
        {statusComponent}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{module.description}</p>
        
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-700">
            <i className="fas fa-clock mr-1"></i> {module.duration} min
          </span>
          <span className="text-sm text-accent font-medium">
            <i className="fas fa-star mr-1"></i> {module.points} points
          </span>
        </div>
        
        {isInProgress && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        
        {isLocked ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            <i className="fas fa-lock text-gray-400"></i>
            <span className="text-sm text-gray-500">Complete previous modules first</span>
          </div>
        ) : (
          <Link href={`/curriculum/${module.id}`}>
            <Button 
              className={`mt-4 w-full ${
                isCompleted 
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {isCompleted ? "Review Module" : isInProgress ? "Continue Module" : "Start Module"}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
