import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatArea } from '@/components/chat/ChatArea';

const HomePage: React.FC = () => {

  return (
    <MainLayout>
      <ChatArea />
    </MainLayout>
  );
};

export default HomePage;
