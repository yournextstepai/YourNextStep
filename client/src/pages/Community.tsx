import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { ThumbsUp, MessageSquare, Calendar, User, Book } from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content must be at most 2000 characters"),
  moduleId: z.string().optional(),
  fileUrl: z.string().optional()
});

type CreatePostFormValues = z.infer<typeof createPostSchema>;

export default function Community() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthContext();
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  
  // Get all posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community/posts"],
    enabled: selectedTab === "all"
  });
  
  // Get posts by the logged in user
  const { data: userPosts = [], isLoading: userPostsLoading } = useQuery({
    queryKey: ["/api/community/user", user?.id, "posts"],
    enabled: selectedTab === "my-posts" && !!user?.id
  });
  
  // Get all modules for the select dropdown
  const { data: modules = [] } = useQuery({
    queryKey: ["/api/modules"]
  });
  
  // Get comments for selected post
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/community/posts", selectedPost, "comments"],
    enabled: !!selectedPost
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostFormValues) => 
      apiRequest("/api/community/posts", "POST", {
        ...data,
        moduleId: data.moduleId ? parseInt(data.moduleId) : undefined
      }),
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/user", user.id, "posts"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: (postId: number) => 
      apiRequest(`/api/community/posts/${postId}/like`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/user", user.id, "posts"] });
      }
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      }
    }
  });
  
  // Unlike post mutation
  const unlikePostMutation = useMutation({
    mutationFn: (postId: number) => 
      apiRequest(`/api/community/posts/${postId}/like`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/user", user.id, "posts"] });
      }
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost] });
      }
    }
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number, content: string }) => 
      apiRequest(`/api/community/posts/${postId}/comments`, "POST", { content }),
    onSuccess: () => {
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost, "comments"] });
      }
      setCommentContent("");
    }
  });
  
  // Create post form
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      moduleId: undefined,
      fileUrl: ""
    }
  });
  
  // Comment form state
  const [commentContent, setCommentContent] = useState("");
  
  const displayPosts = selectedTab === "all" ? posts : userPosts;
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  async function onSubmit(data: CreatePostFormValues) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post.",
        variant: "destructive"
      });
      return;
    }
    
    await createPostMutation.mutateAsync(data);
  }
  
  function handleSelectPost(postId: number) {
    setSelectedPost(postId);
  }
  
  function handleBackToList() {
    setSelectedPost(null);
  }
  
  async function handleLikePost(postId: number) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts.",
        variant: "destructive"
      });
      return;
    }
    
    await likePostMutation.mutateAsync(postId);
  }
  
  async function handleUnlikePost(postId: number) {
    if (!isAuthenticated) return;
    await unlikePostMutation.mutateAsync(postId);
  }
  
  async function handleAddComment() {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedPost) return;
    if (!commentContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }
    
    await addCommentMutation.mutateAsync({
      postId: selectedPost,
      content: commentContent
    });
  }
  
  // Show post detail view if a post is selected
  if (selectedPost) {
    const post = [...posts, ...userPosts].find(p => p.id === selectedPost);
    
    if (!post) return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Button onClick={handleBackToList}>Back to Posts</Button>
        </div>
      </div>
    );
    
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Community Post</h1>
          <Button onClick={handleBackToList}>Back to Posts</Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" /> Posted by User #{post.userId}
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}
              {post.moduleId && (
                <>
                  <span className="mx-2">•</span>
                  <Book className="h-4 w-4" /> Module: {
                    modules.find(m => m.id === post.moduleId)?.title || `#${post.moduleId}`
                  }
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{post.content}</div>
            {post.fileUrl && (
              <div className="mt-4">
                <a 
                  href={post.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View attached file
                </a>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => post.isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id)}
              >
                <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                {post.likesCount}
              </Button>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {comments.length} Comments
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          
          {isAuthenticated && (
            <div className="mb-4">
              <Textarea 
                placeholder="Add a comment..." 
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="mb-2"
              />
              <Button 
                onClick={handleAddComment}
                disabled={addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          )}
          
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" /> User #{comment.userId}
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4" /> {formatDate(comment.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Community</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          )}
          <TabsTrigger value="create-post">Create Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {postsLoading ? (
            <p>Loading posts...</p>
          ) : displayPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map(post => (
                <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2" onClick={() => handleSelectPost(post.id)}>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" /> User #{post.userId}
                      <span className="mx-2">•</span>
                      <Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent onClick={() => handleSelectPost(post.id)}>
                    <p className="line-clamp-3">{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          post.isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id);
                        }}
                      >
                        <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likesCount}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSelectPost(post.id)}>
                      View Post
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>No posts found. Be the first to create a post!</p>
          )}
        </TabsContent>
        
        <TabsContent value="my-posts">
          {userPostsLoading ? (
            <p>Loading your posts...</p>
          ) : displayPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map(post => (
                <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2" onClick={() => handleSelectPost(post.id)}>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {formatDate(post.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent onClick={() => handleSelectPost(post.id)}>
                    <p className="line-clamp-3">{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          post.isLiked ? handleUnlikePost(post.id) : handleLikePost(post.id);
                        }}
                      >
                        <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likesCount}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleSelectPost(post.id)}>
                      View Post
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p>You haven't created any posts yet.</p>
          )}
        </TabsContent>
        
        <TabsContent value="create-post">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <h2 className="text-xl mb-2">Authentication Required</h2>
              <p className="mb-4">Please log in to create a post.</p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create a New Post</CardTitle>
                <CardDescription>
                  Share your thoughts, questions, or work with the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter a title for your post" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your post content here..." 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="moduleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Module (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a module (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modules.map(module => (
                                <SelectItem key={module.id} value={module.id.toString()}>
                                  {module.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a module if your post is related to specific course content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter a URL to your file or image" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Share a link to your work (GitHub, Google Drive, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={createPostMutation.isPending}
                      className="w-full"
                    >
                      {createPostMutation.isPending ? "Creating..." : "Create Post"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}