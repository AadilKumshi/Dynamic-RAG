import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService, UserWithAssistants } from '@/services/admin.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Trash2, FileText, Thermometer, Layers, ScissorsSquare, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithAssistants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteAssistantId, setDeleteAssistantId] = useState<number | null>(null);
  const [grantAdminUserId, setGrantAdminUserId] = useState<number | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/home');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteUserId === null) return;
    try {
      await adminService.deleteUser(deleteUserId);
      setUsers(users.filter(u => u.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteAssistant = async () => {
    if (deleteAssistantId === null) return;
    try {
      await adminService.deleteAssistant(deleteAssistantId);
      setUsers(users.map(user => ({
        ...user,
        assistants: user.assistants.filter(a => a.id !== deleteAssistantId)
      })));
      setDeleteAssistantId(null);
    } catch (error) {
      console.error('Failed to delete assistant:', error);
    }
  };

  const handleGrantAdmin = async () => {
    if (grantAdminUserId === null) return;
    try {
      await adminService.grantAdminPrivileges(grantAdminUserId);
      setUsers(users.map(user => 
        user.id === grantAdminUserId 
          ? { ...user, role: 'admin' }
          : user
      ));
      setGrantAdminUserId(null);
    } catch (error) {
      console.error('Failed to grant admin privileges:', error);
    }
  };

  const toggleUserExpanded = (userId: number) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  const totalUsers = users.length;
  const totalAssistants = users.reduce((sum, user) => sum + user.assistants.length, 0);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            {/* <p className="text-muted-foreground">Manage users and their assistants</p> */}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAssistants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Assistants/User</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalUsers > 0 ? (totalAssistants / totalUsers).toFixed(1) : '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Users</h2>
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            ) : (
              users.map((user) => {
                const isExpanded = expandedUsers.has(user.id);
                const isAdmin = user.role === 'admin' || user.role.includes('ADMIN');
                
                return (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {user.assistants.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleUserExpanded(user.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <div className="space-y-1 flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {user.username}
                              <Badge variant={isAdmin ? 'default' : 'secondary'}>
                                {isAdmin ? 'ADMIN' : 'USER'}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {user.assistants.length} assistant{user.assistants.length !== 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setGrantAdminUserId(user.id)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Grant Admin
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {user.assistants.length > 0 && isExpanded && (
                      <CardContent>
                        <div className="space-y-3">
                          {user.assistants.map((assistant) => (
                            <div
                              key={assistant.id}
                              className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                            >
                              {/* Thumbnail */}
                              <div className="h-16 w-12 flex-shrink-0 border border-border/50 overflow-hidden">
                                {assistant.image_base64 ? (
                                  <img
                                    src={`data:image/png;base64,${assistant.image_base64}`}
                                    alt={assistant.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-muted">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">{assistant.name}</h4>
                                <p className="text-xs text-muted-foreground mb-2">{assistant.file_name}</p>
                                
                                {/* Parameters */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Temp:</span>
                                    <span className="font-medium">{assistant.temperature}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Layers className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Top K:</span>
                                    <span className="font-medium">{assistant.top_k}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ScissorsSquare className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Chunk:</span>
                                    <span className="font-medium">{assistant.chunk_size}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Layers className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Overlap:</span>
                                    <span className="font-medium">{assistant.chunk_overlap}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteAssistantId(assistant.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This will also delete all their assistants and chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Assistant Confirmation */}
      <AlertDialog open={deleteAssistantId !== null} onOpenChange={() => setDeleteAssistantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assistant? This will also delete all associated chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssistant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Grant Admin Confirmation */}
      <AlertDialog open={grantAdminUserId !== null} onOpenChange={() => setGrantAdminUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Admin Privileges</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to grant admin privileges to this user? They will have full access to the admin dashboard and can manage all users and assistants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGrantAdmin} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Grant Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
