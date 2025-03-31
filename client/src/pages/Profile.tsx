import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "@/components/profile/ProfileForm";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
        <p className="mt-2 text-sm text-gray-700">Manage your account settings and preferences</p>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                {isLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl mb-4">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      user?.firstName?.charAt(0) || "U"
                    )}
                  </div>
                )}
                
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-24 mb-4" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user ? `${user.firstName} ${user.lastName}` : "User"}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Grade {user?.grade || "?"} Student</p>
                  </>
                )}
                
                <div className="w-full pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Total Points</span>
                    {isLoading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{user?.points || 0}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Referral Code</span>
                    {isLoading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{user?.referralCode || "N/A"}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Created</span>
                    {isLoading ? (
                      <Skeleton className="h-5 w-24" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="px-6 py-4">
                <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="info">Personal Info</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="px-6 py-4 border-t border-gray-200">
                <TabsContent value="info" className="mt-0">
                  <ProfileForm />
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Change Password</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <input 
                          type="password" 
                          placeholder="Current Password"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input 
                          type="password" 
                          placeholder="New Password"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input 
                          type="password" 
                          placeholder="Confirm New Password"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <button className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                        Update Password
                      </button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <i className="fas fa-lock mr-2"></i>
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="mt-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Dark Mode</h4>
                        <p className="text-xs text-gray-500">Enable dark mode for the app interface</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-darkmode" className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Email Notifications</h4>
                        <p className="text-xs text-gray-500">Receive email updates about your progress</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-email" className="sr-only" defaultChecked />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-7 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Language</h4>
                        <p className="text-xs text-gray-500">Select your preferred language</p>
                      </div>
                      <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="mt-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Progress Updates</h4>
                        <p className="text-xs text-gray-500">Get notified about your learning progress</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-progress" className="sr-only" defaultChecked />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-7 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">New Modules</h4>
                        <p className="text-xs text-gray-500">Get notified when new modules are available</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-modules" className="sr-only" defaultChecked />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-7 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Scholarship Opportunities</h4>
                        <p className="text-xs text-gray-500">Get notified about new scholarship opportunities</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-scholarships" className="sr-only" defaultChecked />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-7 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Career Recommendations</h4>
                        <p className="text-xs text-gray-500">Get notified about new career recommendations</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-careers" className="sr-only" defaultChecked />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-7 top-1 h-4 w-4 bg-white rounded-full transition"></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
