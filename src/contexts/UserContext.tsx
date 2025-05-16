
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type AppUser = {
  id: string;
  name: string | null;
  email: string | undefined;
  phone: string | null;
  role: Tables<'user_roles'>['role'] | null;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

interface UserContextType {
  currentUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<{ user: SupabaseUser | null } | undefined>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        
        setSession(activeSession);
        
        if (activeSession?.user) {
          await fetchUserProfile(activeSession.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.id);
      setSession(newSession);
      
      if (newSession?.user) {
        await fetchUserProfile(newSession.user);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      
      if (event !== 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" error, which is expected for new users
        console.error('Error fetching profile:', profileError);
      }

      // Fetch user role data
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error fetching user role:', roleError);
      }

      const appUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profile?.name ?? supabaseUser.email?.split('@')[0] ?? null,
        phone: profile?.phone ?? null,
        role: userRole?.role ?? null,
      };
      
      // Check if profile has address data and add it to the user if it exists
      if (profile && profile.address) {
        appUser.address = profile.address as AppUser['address'];
      }
      
      setCurrentUser(appUser);
      setIsAdmin(userRole?.role === 'admin');
      console.log('User profile set:', appUser, 'isAdmin:', userRole?.role === 'admin');

    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setCurrentUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      console.log('Login successful:', data);
      
      // fetchUserProfile will be called by the auth state change listener
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      // Don't set loading=false here as it will be handled by the auth listener
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // First attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (!data.user) throw new Error('Falha ao obter dados do usuário');

      // After login is successful, check if user has admin role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError) {
        // If there's an error or no role found, sign out and throw error
        await supabase.auth.signOut();
        throw new Error('Erro ao verificar permissões de administrador');
      }

      if (userRole?.role !== 'admin') {
        // If user is not an admin, sign them out and throw error
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Você não tem permissões de administrador.');
      }

      console.log('Admin login successful:', data.user.id);
      // fetchUserProfile will be called by the auth state change listener
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      // Don't set loading=false here as it will be handled by the auth listener
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) throw error;
      
      // Return the user data for immediate use
      return { user: data.user };
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsAdmin(false);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, session, loading, isAdmin, login, adminLogin, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
