
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
    console.log("UserProvider initialized");
    
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
        console.log("Checking for existing session");
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        
        console.log("Active session:", activeSession?.user?.id || "None");
        setSession(activeSession);
        
        if (activeSession?.user) {
          await fetchUserProfile(activeSession.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log("Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log('Fetching user profile for:', supabaseUser.id);
    setLoading(true);
    
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') {
          console.log('No profile found, creating one');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: supabaseUser.id,
              email: supabaseUser.email,
              name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || null
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        }
      }

      // Try to fetch the profile again if it wasn't found initially
      const finalProfile = profile || (await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()).data;

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
        name: finalProfile?.name ?? supabaseUser.user_metadata?.name ?? supabaseUser.email?.split('@')[0] ?? null,
        phone: finalProfile?.phone ?? null,
        role: userRole?.role ?? null,
      };
      
      // Check if profile has address data and add it to the user if it exists
      if (finalProfile && finalProfile.address) {
        appUser.address = finalProfile.address as AppUser['address'];
      }
      
      setCurrentUser(appUser);
      const isUserAdmin = userRole?.role === 'admin';
      setIsAdmin(isUserAdmin);
      console.log('User profile set:', appUser, 'isAdmin:', isUserAdmin);

    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
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
      
      console.log('Login successful:', data.user?.id);
      // fetchUserProfile será chamado pelo listener de mudança de estado de autenticação
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

      console.log('Basic login successful, checking admin role');
      
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
      
      console.log('Signup successful:', data.user?.id);
      
      if (data.user) {
        // Criar perfil do usuário imediatamente após o registro
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name
          });
          
        if (profileError) {
          console.error('Error creating profile during signup:', profileError);
        }
      }
      
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
