
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
    // Configuração do listener de autenticação primeiro
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.id);
      setSession(newSession);
      
      if (newSession?.user) {
        // Usar setTimeout para evitar deadlock
        setTimeout(() => {
          fetchUserProfile(newSession.user);
        }, 0);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    // Em seguida, verificar a sessão existente
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    setLoading(true);
    try {
      console.log('Fetching user profile for:', supabaseUser.id);
      
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
      const isUserAdmin = userRole?.role === 'admin';
      setIsAdmin(isUserAdmin);
      console.log('User profile set:', appUser, 'isAdmin:', isUserAdmin);

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
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data);
      // fetchUserProfile será chamado pelo listener de mudança de estado de autenticação
      return;
    } catch (error: any) {
      setLoading(false);
      console.error('Login error:', error);
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting admin login for:', email);
      // Primeiro tenta fazer login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Admin login auth error:', error);
        throw error;
      }
      
      if (!data.user) {
        console.error('Admin login - no user data');
        throw new Error('Falha ao obter dados do usuário');
      }

      // Após login bem-sucedido, verifica se o usuário tem papel de administrador
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError) {
        console.error('Admin login role error:', roleError);
        // Se houver erro ou nenhum papel encontrado, encerra a sessão e lança erro
        await supabase.auth.signOut();
        throw new Error('Erro ao verificar permissões de administrador');
      }

      if (userRole?.role !== 'admin') {
        console.error('User is not admin:', userRole?.role);
        // Se o usuário não for administrador, encerra a sessão e lança erro
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Você não tem permissões de administrador.');
      }

      console.log('Admin login successful:', data.user.id, 'Role:', userRole.role);
      // fetchUserProfile será chamado pelo listener de mudança de estado de autenticação
      
    } catch (error: any) {
      setLoading(false);
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting signup for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      console.log('Signup successful:', data);
      // Retorna os dados do usuário para uso imediato
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
      console.log('Logout successful');
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
