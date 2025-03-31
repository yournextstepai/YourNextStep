import ChatInterface from "@/components/chatbot/ChatInterface";

export default function Chatbot() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Ara - Your AI Career Coach</h1>
        <p className="mt-2 text-sm text-gray-700">Ask me anything about careers, college, or skill development</p>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <ChatInterface />
      </div>
    </div>
  );
}
