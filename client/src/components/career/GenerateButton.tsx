import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onGenerate: () => void;
  isPending: boolean;
}

export default function GenerateButton({ onGenerate, isPending }: GenerateButtonProps) {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <i className="fas fa-lightbulb text-2xl text-primary"></i>
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-2">Discover Your Career Path</h3>
        <p className="text-gray-500 max-w-md mb-6">
          Generate personalized career recommendations based on your interests, skills, and completed modules.
        </p>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          size="lg"
          onClick={onGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Generating Recommendations...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              Generate Career Recommendations
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-400 mt-4">
          Complete at least 3 modules to get the most accurate recommendations
        </p>
      </CardContent>
    </Card>
  );
}
