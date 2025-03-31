import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function QuickChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/chat/messages", {
        message: message.trim()
      });
      
      const data = await res.json();
      // Extract bot response (second message in the array)
      if (data && Array.isArray(data) && data.length > 1) {
        setResponse(data[1].message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message failed",
        description: "Could not send your message to Ara",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Quick Chat with Ara</CardTitle>
        <i className="fas fa-robot text-primary text-2xl"></i>
      </CardHeader>
      
      <CardContent className="px-4 pb-5">
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          {response ? (
            <p className="text-sm text-gray-700">{response}</p>
          ) : (
            <p className="text-sm text-gray-700">Need help with your career exploration? I'm here to assist with your questions!</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex">
          <Input
            type="text"
            placeholder="Ask Ara a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 focus:ring-primary focus:border-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
        
        <div className="mt-3">
          <Link href="/chatbot">
            <a className="text-primary text-sm hover:underline">Go to full conversation</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
