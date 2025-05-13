
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types'; // Certifique-se que este caminho está correto e o arquivo existe

export type AppUser = {
  id: string;
  name: string | null;
  email: string | undefined;
  phone: string | null;
  role: Tables<'user_roles'>['role'] | null;
};

interface UserContextType {
  currentUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      if (activeSession?.user) {
        await fetchUserProfile(activeSession.user);
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, activeSession) => {
      setSession(activeSession);
      if (activeSession?.user) {
        await fetchUserProfile(activeSession.user);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      if (_event === 'INITIAL_SESSION') {
         // Handle initial session if needed, or remove if getSession covers it
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();
      
      // It's possible a user has a profile but no role yet, or vice-versa in some edge cases.
      // Handle roleError if user might not have a role, e.g. new user before role assignment.
      // For now, we assume roleError means no specific role or an actual error.

      const appUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profile?.name ?? null,
        phone: profile?.phone ?? null,
        role: userRole?.role ?? null,
      };
      setCurrentUser(appUser);
      setIsAdmin(userRole?.role === 'admin');

    } catch (error) {
      console.error('Error fetching user profile or role:', error);
      setCurrentUser(null); // Clear user if profile fetch fails
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    // onAuthStateChange will handle setting user and loading
  };

  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    if (data.user) {
      // Fetch profile and role to confirm admin status
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleError || userRole?.role !== 'admin') {
        await supabase.auth.signOut(); // Sign out if not an admin
        setLoading(false);
        throw new Error('Acesso negado. Credenciais de administrador inválidas ou sem permissão.');
      }
      // onAuthStateChange will handle setting user and loading state update after successful check.
    }
  };


  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // This goes into raw_user_meta_data for the trigger
        },
      },
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    // After signup, Supabase might send a confirmation email.
    // The handle_new_user trigger will create a profile.
    // We might want to assign a default 'customer' role here if needed.
    if (data.user) {
        // Optionally assign 'customer' role upon signup
        const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: 'customer' });
        if (roleInsertError) {
            console.error("Error assigning default role:", roleInsertError);
            // Decide how to handle this: sign out user, show error, or log and continue?
            // For now, just logging.
        }
    }
    // onAuthStateChange will handle setting user and loading
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoading(false);
      throw error;
    }
    setCurrentUser(null);
    setIsAdmin(false);
    setSession(null);
    // setLoading(false) will be handled by onAuthStateChange if it fires, or here if needed.
    setLoading(false); // Ensure loading is false after sign out completes
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
