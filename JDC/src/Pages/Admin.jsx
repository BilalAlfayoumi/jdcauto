import React, { useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Car, FileText, KeyRound, LogOut, RefreshCw, Save, Search, ShieldCheck } from 'lucide-react';
import {
  adminLogin,
  adminLogout,
  getAdminSession,
  getAdminVehicles,
  getCarteGrisePricing,
  saveCarteGrisePricing,
  updateAdminVehicleStatus,
} from '../api/adminClient';
import { cloneCarteGrisePricing, defaultCarteGrisePricing } from '../data/carteGrisePricing';
import { DEFAULT_VEHICLE_IMAGE } from '../utils';

function formatPrice(price) {
  if (!price.includes('€')) {
    return price;
  }

  const [euros, centimes] = price.split('€');
  return (
    <>
      {euros}€<span className="text-base">{centimes}</span>
    </>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [pricingItems, setPricingItems] = useState(cloneCarteGrisePricing());
  const [vehicleSearch, setVehicleSearch] = useState('');
  const deferredVehicleSearch = useDeferredValue(vehicleSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusDrafts, setStatusDrafts] = useState({});

  const sessionQuery = useQuery({
    queryKey: ['admin-session'],
    queryFn: getAdminSession,
    staleTime: 0,
    cacheTime: 0,
  });

  const pricingQuery = useQuery({
    queryKey: ['carte-grise-pricing'],
    queryFn: getCarteGrisePricing,
    enabled: !!sessionQuery.data?.authenticated,
    staleTime: 0,
    cacheTime: 0,
  });

  const vehiclesQuery = useQuery({
    queryKey: ['admin-vehicles', statusFilter, deferredVehicleSearch],
    queryFn: () => getAdminVehicles({ status: statusFilter, q: deferredVehicleSearch }),
    enabled: !!sessionQuery.data?.authenticated,
    staleTime: 0,
    cacheTime: 0,
  });

  useEffect(() => {
    const nextItems = pricingQuery.data?.length ? pricingQuery.data : defaultCarteGrisePricing;
    setPricingItems(cloneCarteGrisePricing(nextItems));
  }, [pricingQuery.data]);

  useEffect(() => {
    if (!vehiclesQuery.data) {
      return;
    }

    const drafts = {};
    vehiclesQuery.data.forEach((vehicle) => {
      drafts[vehicle.id] = vehicle.manual_status_override || 'AUTO';
    });
    setStatusDrafts(drafts);
  }, [vehiclesQuery.data]);

  const loginMutation = useMutation({
    mutationFn: () => adminLogin(password),
    onSuccess: async () => {
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

  const savePricingMutation = useMutation({
    mutationFn: () => saveCarteGrisePricing(pricingItems),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['carte-grise-pricing'] });
      toast.success('Tarifs carte grise enregistrés');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ vehicleId, status }) => updateAdminVehicleStatus(vehicleId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'featured'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'hero-search'] });
      toast.success('Statut véhicule mis à jour');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const authenticated = !!sessionQuery.data?.authenticated;

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Chargement de l’espace admin...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-8">
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
              <span className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</span>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Mot de passe admin"
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

            <p className="text-xs text-slate-500">
              En local Docker, le mot de passe par défaut est `admin123`.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <img
            src="/LOGO.jpg"
            alt="JDC Auto"
            className="h-14 w-auto object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Tarifs carte grise</h2>
                <p className="text-slate-500">Les modifications seront visibles sur la page publique.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => savePricingMutation.mutate()}
              disabled={savePricingMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {savePricingMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pricingItems.map((item, index) => (
              <div key={item.id} className={`rounded-3xl border p-5 ${item.popular ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    {item.subtitle && <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>}
                  </div>
                  {item.popular && (
                    <span className="text-xs font-bold uppercase tracking-wide bg-red-600 text-white px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Prix affiché</span>
                    <input
                      type="text"
                      value={item.price}
                      onChange={(event) => {
                        const next = cloneCarteGrisePricing(pricingItems);
                        next[index].price = event.target.value;
                        setPricingItems(next);
                      }}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Note</span>
                    <input
                      type="text"
                      value={item.note}
                      onChange={(event) => {
                        const next = cloneCarteGrisePricing(pricingItems);
                        next[index].note = event.target.value;
                        setPricingItems(next);
                      }}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Aperçu</p>
                  <div className="text-2xl font-bold text-red-600">{formatPrice(item.price)}</div>
                  <p className="text-sm text-slate-500">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Statut des véhicules</h2>
                <p className="text-slate-500">Passe un véhicule en disponible ou vendu. Le statut choisi est conservé après synchro.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <label className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vehicleSearch}
                  onChange={(event) => setVehicleSearch(event.target.value)}
                  placeholder="Rechercher Ford Mustang, référence, version..."
                  className="w-full md:w-80 rounded-2xl border border-slate-300 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="all">Tous les statuts</option>
                <option value="Disponible">Disponible</option>
                <option value="Vendu">Vendu</option>
                <option value="Réservé">Réservé</option>
              </select>

              <button
                type="button"
                onClick={() => vehiclesQuery.refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Rafraîchir
              </button>
            </div>
          </div>

          {vehiclesQuery.isLoading ? (
            <div className="text-slate-500">Chargement des véhicules...</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {vehiclesQuery.data?.map((vehicle) => (
                <div key={vehicle.id} className="rounded-3xl border border-slate-200 p-4 md:p-5 bg-slate-50">
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex gap-4 items-start">
                      <img
                        src={vehicle.image_url || DEFAULT_VEHICLE_IMAGE}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-28 h-20 rounded-2xl object-cover border border-slate-200"
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
                        }}
                      />

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            vehicle.status === 'Disponible'
                              ? 'bg-emerald-100 text-emerald-700'
                              : vehicle.status === 'Vendu'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}>
                            {vehicle.status}
                          </span>
                          {vehicle.manual_override_active && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                              Statut forcé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Réf. {vehicle.reference} • {vehicle.year} • {vehicle.mileage.toLocaleString('fr-FR')} km • {vehicle.price.toLocaleString('fr-FR')} €
                        </p>
                        {vehicle.version && (
                          <p className="text-sm text-slate-500 mt-1">{vehicle.version}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          Statut automatique Spider: {vehicle.synced_status || 'Non renseigné'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col md:flex-row gap-3">
                      <select
                        value={statusDrafts[vehicle.id] || 'AUTO'}
                        onChange={(event) => {
                          setStatusDrafts((current) => ({
                            ...current,
                            [vehicle.id]: event.target.value,
                          }));
                        }}
                        className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="AUTO">Automatique (Spider)</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Vendu">Vendu</option>
                        <option value="Réservé">Réservé</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => updateStatusMutation.mutate({
                          vehicleId: vehicle.id,
                          status: statusDrafts[vehicle.id] || 'AUTO',
                        })}
                        disabled={updateStatusMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold hover:bg-black transition-colors disabled:opacity-60"
                      >
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!vehiclesQuery.data?.length && (
                <div className="xl:col-span-2 rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                  Aucun véhicule trouvé avec ces filtres.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
