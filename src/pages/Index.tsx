
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Auth } from '../components/Auth';
import { Dashboard } from '../components/Dashboard';

const Index = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Auth />;
  }

  return <Dashboard onPageChange={setCurrentPage} />;
};

export default Index;
