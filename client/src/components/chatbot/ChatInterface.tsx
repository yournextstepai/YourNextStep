import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  isFromUser: boolean;
  createdAt: string;
}

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });
  
  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("/api/chat/messages", "POST", { message });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the messages query to fetch updated messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Message failed",
        description: "Could not send your message to Ara",
        variant: "destructive"
      });
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === "") return;
    sendMessage(message);
  };
  
  // Suggested questions
  const suggestedQuestions = [
    "What colleges offer good CS programs?",
    "How to prepare for internships?",
    "What skills should I develop in high school?"
  ];
  
  // Handle clicking on suggested question
  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    sendMessage(question);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <i className="fas fa-robot text-primary"></i>
        </div>
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Ara</h3>
          <p className="text-xs text-gray-500">AI-powered career coach</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-mock="true">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className={`flex items-start ${index % 2 === 0 ? "" : "justify-end"}`}>
              <div className={`${index % 2 === 0 ? "mr-3" : "order-2 ml-3"}`}>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <Skeleton className={`h-20 ${index % 2 === 0 ? "w-3/4" : "w-2/3"} rounded-lg`} />
            </div>
          ))
        ) : messages.length > 0 ? (
          // Real chat messages
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-start ${msg.isFromUser ? "justify-end" : ""}`}>
              {!msg.isFromUser && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <i className="fas fa-robot text-primary text-sm"></i>
                  </div>
                </div>
              )}
              
              <div className={`${
                msg.isFromUser 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-800"
                } rounded-lg p-3 max-w-[80%]`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
              
              {msg.isFromUser && (
                <div className="flex-shrink-0 ml-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <i className="fas fa-user text-gray-600 text-sm"></i>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // Welcome message when no messages exist
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="fas fa-robot text-primary text-sm"></i>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Hi there! I'm Ara, your AI career coach. How can I help you today with your career exploration journey?
              </p>
            </div>
          </div>
        )}
        
        {/* Auto-scroll reference */}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 focus:ring-primary focus:border-primary"
            disabled={isPending}
          />
          <Button 
            type="submit" 
            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            disabled={isPending || message.trim() === ""}
          >
            {isPending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
        
        {/* Suggested questions */}
        <div className="flex flex-wrap text-xs text-gray-500 mt-2">
          <span className="mr-2">Suggested questions:</span>
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="ml-2 text-primary hover:underline"
              onClick={() => handleSuggestedQuestion(question)}
              disabled={isPending}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
