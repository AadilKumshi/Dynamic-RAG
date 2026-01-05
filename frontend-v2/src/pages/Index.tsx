import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  // COMMENTED OUT FOR DESIGN TESTING - bypassing auth
  // const { isAuthenticated, isLoading } = useAuth();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="animate-pulse text-muted-foreground">Loading...</div>
  //     </div>
  //   );
  // }

  // if (isAuthenticated) {
  //   return <Navigate to="/home" replace />;
  // }

  // return <Navigate to="/login" replace />;
  
  // TEMPORARY: Redirect directly to home to view design
  return <Navigate to="/home" replace />;
};

export default Index;
