import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CareerCardProps {
  career: any;
}

export default function CareerCard({ career }: CareerCardProps) {
  // Format salary
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{career.title}</h3>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-2 bg-primary/20">
            <i className="fas fa-briefcase text-primary"></i>
          </div>
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
            {career.matchScore}% Match
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-500 mb-4">{career.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Field of Study:</span>
            <span className="text-gray-900 font-medium">{career.fieldOfStudy}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Average Salary:</span>
            <span className="text-gray-900 font-medium">
              {career.avgSalary ? formatSalary(career.avgSalary) : "Varies"}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Education Required:</span>
            <span className="text-gray-900 font-medium">{career.eduRequirements}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Match Score</span>
            <span className="text-xs font-medium text-gray-900">{career.matchScore}%</span>
          </div>
          <Progress value={career.matchScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
