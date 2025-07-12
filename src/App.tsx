
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BrowseUsers } from './components/BrowseUsers';
import { Messages } from './components/Messages';
import { Auth } from './components/Auth';

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'browse':
        return <BrowseUsers />;
      case 'messages':
        return <Messages />;
      case 'matches':
        return <Messages />;
      case 'courses':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'profile':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'settings':
        return <Dashboard onPageChange={setCurrentPage} />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
