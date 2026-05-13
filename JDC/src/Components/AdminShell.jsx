import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { adminLogin, adminLogout, getAdminSession } from '../api/adminClient';

function LoginScreen({ username, password, setUsername, setPassword, loginMutation }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin JDC Auto</h1>
            <p className="text-sm text-slate-500">Accès protégé</p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate();
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-2">Identifiant</span>
            <div className="relative">
              <UserRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Identifiant admin"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</span>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Mot de passe admin"
                autoComplete="current-password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-2xl bg-red-600 text-white font-semibold py-3 hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminShell({ activeTab, headerActions = null, children }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const inactivityTimeoutRef = useRef(null);

  const sessionQuery = useQuery({
    queryKey: ['admin-session'],
    queryFn: getAdminSession,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 60000,
  });

  const loginMutation = useMutation({
    mutationFn: () => adminLogin(username, password),
    onSuccess: async () => {
      setUsername('');
      setPassword('');
      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
      toast.success('Connexion admin réussie');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: adminLogout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
      toast.success('Déconnexion réussie');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!sessionQuery.data?.authenticated) {
      return undefined;
    }

    const timeoutMs = Math.max(1, sessionQuery.data.session_timeout_minutes || 30) * 60 * 1000;

    const scheduleLogout = () => {
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }

      inactivityTimeoutRef.current = window.setTimeout(() => {
        toast.error('Session expirée après inactivité');
        logoutMutation.mutate();
      }, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => scheduleLogout();

    scheduleLogout();
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));

    return () => {
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
    };
  }, [logoutMutation, sessionQuery.data]);

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Chargement de l’espace admin...</div>
      </div>
    );
  }

  if (!sessionQuery.data?.authenticated) {
    return (
      <LoginScreen
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        loginMutation={loginMutation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <img
              src="/LOGO.jpg"
              alt="JDC Auto"
              className="h-12 sm:h-14 w-auto object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/admin/vehicles"
                className={`px-3 sm:px-4 py-2 rounded-2xl font-semibold transition-colors text-sm sm:text-base ${
                  activeTab === 'vehicles' ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Nos véhicules
              </NavLink>
              <NavLink
                to="/admin/carte-grise"
                className={`px-3 sm:px-4 py-2 rounded-2xl font-semibold transition-colors text-sm sm:text-base ${
                  activeTab === 'carte-grise' ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Carte grise
              </NavLink>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            {headerActions}
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-sm">
              <UserRound className="w-4 h-4" />
              {sessionQuery.data.username || 'admin'}
            </div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
