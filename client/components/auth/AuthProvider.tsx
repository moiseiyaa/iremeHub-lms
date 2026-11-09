'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { initActivityTracker } from '../../app/utils/auth';
import { apiGet } from '../../app/api/apiClient';

export interface CurrentUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'educator' | 'admin';
  avatar?: {url?: string; public_id?: string} | string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: CurrentUser | null;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
const AuthContext=createContext<AuthContextType | undefined>(undefined);
export function useAuth(){
  const ctx=useContext(AuthContext);
  if(!ctx)throw new Error('useAuth must be used within AuthProvider.');
  return ctx;
}
export function AuthProvider({children}:{children:ReactNode}){
  const router=useRouter();
  const pathname=usePathname();
  const [user,setUser]=useState<CurrentUser|null>(null);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState(false);
  const [mode,setMode]=useState<'login'|'register'>('login');

  const checkAuth=useCallback(async()=>{
    if(typeof window==='undefined')return;
    const token=window.localStorage.getItem('token');
    if(!token){setUser(null);setLoading(false);return;}
    setLoading(true);
    try {
      const result=await apiGet<CurrentUser>('/auth/me',true);
      if(result.success&&result.data&&['admin','educator','student'].includes(result.data.role)){
        setUser(result.data);
      }else setUser(null);
    }catch {setUser(null);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    void checkAuth();
    const cleanup=initActivityTracker();
    const sync=()=>{void checkAuth();};
    window.addEventListener('iremehub:auth-changed',sync);
    const onStorage=(event:StorageEvent)=>{if(event.key==='token')void checkAuth();};
    window.addEventListener('storage',onStorage);
    return()=>{
      cleanup();
      window.removeEventListener('iremehub:auth-changed',sync);
      window.removeEventListener('storage',onStorage);
    };
  },[checkAuth]);

  useEffect(()=>{if(pathname==='/login'||pathname==='/register')setOpen(false);},[pathname]);

  const logout=()=>{
    if(typeof window!=='undefined'){
      // Clear the legacy HttpOnly cookie as well as the browser token.
      // Full bearer-token revocation requires the upcoming session store.
      void fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      }).catch(() => undefined);
      window.localStorage.removeItem('token');
    }
    setUser(null);setOpen(false);
    const protectedRoute=Boolean(pathname&&(/^(\/dashboard|\/profile|\/change-password|\/certificates)(\/|$)/.test(pathname)||/\/learn(\/|$)/.test(pathname)));
    if(protectedRoute)router.replace('/login');
  };

  return <AuthContext.Provider value={{
    user,isAuthenticated:!!user,loading,checkAuth,logout,
    openLoginModal:()=>{setMode('login');setOpen(true);},
    openRegisterModal:()=>{setMode('register');setOpen(true);},
    closeAuthModal:()=>setOpen(false),
  }}>
    {children}
    <AuthModal isOpen={open} onClose={()=>setOpen(false)} initialMode={mode}/>
  </AuthContext.Provider>;
}
