import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SendHorizonal, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@shared/schema";

// Module-specific bot prompts and hints
const MODULE_PROMPTS: Record<number, string[]> = {
  // Default prompts for any module
  0: [
    "👋 Need any help with this module?",
    "🔍 What would you like to know more about?",
    "💬 Ask me any questions about the content!",
    "📚 I can explain concepts in different ways if you need me to."
  ],
  // Module 1: Career Exploration Fundamentals
  1: [
    "🧭 Ready to explore career paths that match your interests?",
    "🤔 Wondering how to identify your strengths and weaknesses?",
    "💼 Ask me about different career fields you might be interested in!",
    "🎯 Need help setting career exploration goals?"
  ],
  // Module 2: Resume Building
  2: [
    "📝 Need help creating a standout resume?",
    "🔍 Wondering what skills to highlight for your dream job?",
    "💬 Ask me for tips on writing an effective personal statement!",
    "📊 I can help you organize your experiences effectively."
  ],
  // Module 3: Interview Prep
  3: [
    "🎤 Want to practice answering common interview questions?",
    "👔 Need advice on what to wear to your interview?",
    "🤝 Ask me about proper interview etiquette!",
    "⏰ I can share tips on how to prepare the day before an interview."
  ],
  // Module 4: College Application Process
  4: [
    "🎓 Need guidance on selecting colleges that match your goals?",
    "📋 Wondering about college application requirements?",
    "💰 Ask me about scholarship opportunities!",
    "📝 Need help brainstorming college essay topics?"
  ],
  // Module 5: Financial Literacy
  5: [
    "💵 Want to learn about managing money during college?",
    "🏦 Curious about different types of student loans?",
    "💰 Ask me about creating a budget for your education!",
    "📊 Need help understanding financial aid offers?"
  ]
};

// ModuleBot component accepts moduleId and moduleTitle props
interface ModuleBotProps {
  moduleId: number | null;
  moduleTitle: string;
}

export default function ModuleBot({ moduleId = 0, moduleTitle = "this module" }: ModuleBotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const { isAuthenticated, user } = useAuthContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Generate a prompt set specific to this module, fallback to default if not found
  const moduleSpecificPrompts = moduleId && MODULE_PROMPTS[moduleId] 
    ? MODULE_PROMPTS[moduleId] 
    : MODULE_PROMPTS[0];
  
  // Randomly select a prompt to show initially
  const [currentPrompt, setCurrentPrompt] = useState(
    moduleSpecificPrompts[Math.floor(Math.random() * moduleSpecificPrompts.length)]
  );
  
  // Fetch previous chat messages
  const { data: chatMessages = [], isLoading: isMessagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });
  
  // Filter messages that might be related to this module
  // This is a simple implementation - in a real app, you'd store module context with messages
  const moduleKeywords = moduleTitle.toLowerCase().split(" ");
  const relevantMessages = chatMessages.filter((msg: any) => {
    const messageLower = msg.message.toLowerCase();
    return moduleKeywords.some(keyword => 
      keyword.length > 3 && messageLower.includes(keyword)
    );
  });
  
  // We'll show module-specific messages plus the last 5 general messages
  const displayMessages = relevantMessages.length > 0 
    ? relevantMessages 
    : chatMessages.slice(-5);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => 
      apiRequest("/api/chat/messages", "POST", { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setInputValue("");
      setIsFirstInteraction(false);
    },
    onError: () => {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isOpen]);
  
  // Rotate bot prompts every 15 seconds if user hasn't interacted yet
  useEffect(() => {
    if (!isOpen || !isFirstInteraction) return;
    
    const interval = setInterval(() => {
      const newPrompt = moduleSpecificPrompts[
        Math.floor(Math.random() * moduleSpecificPrompts.length)
      ];
      setCurrentPrompt(newPrompt);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOpen, isFirstInteraction, moduleSpecificPrompts]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim() || !isAuthenticated) return;
    
    // Preprocess the message to include module context
    // This helps the AI understand what module the student is asking about
    const processedMessage = `[Re: ${moduleTitle}] ${inputValue}`;
    sendMessageMutation.mutate(processedMessage);
  };
  
  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  // Toggle the bot open/closed
  const toggleBot = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary text-white">
              <AvatarImage src="/bot-avatar.png" alt="Ara" />
              <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <CardTitle className="text-md">Ara</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleBot}>
            {isOpen ? "Minimize" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <>
          <CardContent className="h-[400px] overflow-y-auto">
            {isAuthenticated ? (
              <>
                {/* Bot welcome message */}
                <div className="flex gap-2 mb-4">
                  <Avatar className="h-8 w-8 mt-0.5 bg-primary/20">
                    <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none mb-1 text-sm">
                      <p>Hi {user?.username || "there"}! I'm Ara, your AI learning assistant for <strong>{moduleTitle}</strong>.</p>
                      <p className="mt-2">{currentPrompt}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Ara • Just now</span>
                  </div>
                </div>
                
                {/* Chat messages */}
                {isMessagesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-2/3 ml-auto" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                ) : displayMessages.length > 0 && !isFirstInteraction ? (
                  displayMessages.map((message: any, index: number) => (
                    <div 
                      key={index}
                      className={`flex gap-2 mb-4 ${message.isFromUser ? 'flex-row-reverse' : ''}`}
                    >
                      {message.isFromUser ? (
                        <Avatar className="h-8 w-8 mt-0.5 bg-secondary/20">
                          <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8 mt-0.5 bg-primary/20">
                          <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`flex-1 ${message.isFromUser ? 'text-right' : ''}`}>
                        <div 
                          className={`p-3 rounded-lg text-sm ${
                            message.isFromUser 
                              ? 'bg-primary text-primary-foreground rounded-tr-none ml-auto' 
                              : 'bg-muted rounded-tl-none'
                          }`}
                        >
                          {/* Remove module context from displayed message if present */}
                          {message.isFromUser && message.message.startsWith(`[Re: ${moduleTitle}]`)
                            ? message.message.substring(`[Re: ${moduleTitle}]`.length)
                            : message.message
                          }
                        </div>
                        <span className="text-xs text-muted-foreground block mt-1">
                          {message.isFromUser ? user?.username : 'Ara'} • {
                            new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </span>
                      </div>
                    </div>
                  ))
                ) : null}
                
                {/* Loading indicator when sending message */}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-2 mb-4">
                    <Avatar className="h-8 w-8 mt-0.5 bg-primary/20">
                      <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg rounded-tl-none mb-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Reference for auto-scrolling */}
                <div ref={messagesEndRef}></div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sign In to Chat with Ara</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized help with {moduleTitle} from your AI learning assistant.
                </p>
                <Button variant="default" asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            )}
          </CardContent>
          
          {isAuthenticated && (
            <CardFooter className="pt-0">
              <div className="flex w-full gap-2">
                <Input
                  placeholder={`Ask about ${moduleTitle}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sendMessageMutation.isPending}
                >
                  <SendHorizonal className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
}