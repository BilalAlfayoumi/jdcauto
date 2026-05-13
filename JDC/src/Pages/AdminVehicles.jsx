import React, { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowUpDown, Car, ExternalLink, RefreshCw, Save, Search } from 'lucide-react';
import AdminShell from '../Components/AdminShell';
import AdminActivityList from '../Components/AdminActivityList';
import { getAdminActivity, getAdminVehicles, updateAdminVehicleStatus } from '../api/adminClient';
import { createPageUrl, DEFAULT_VEHICLE_IMAGE } from '../utils';

function statusBadgeClasses(status) {
  if (status === 'Disponible') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (status === 'Vendu') {
    return 'bg-slate-200 text-slate-700';
  }
  return 'bg-amber-100 text-amber-700';
}

export default function AdminVehicles() {
  const queryClient = useQueryClient();
  const [vehicleSearch, setVehicleSearch] = useState('');
  const deferredVehicleSearch = useDeferredValue(vehicleSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_desc');
  const [page, setPage] = useState(1);
  const [statusDrafts, setStatusDrafts] = useState({});

  const vehiclesQuery = useQuery({
    queryKey: ['admin-vehicles', statusFilter, deferredVehicleSearch, brandFilter, modelFilter, yearFilter, sortBy, page],
    queryFn: () => getAdminVehicles({
      status: statusFilter,
      q: deferredVehicleSearch,
      brand: brandFilter,
      model: modelFilter,
      year: yearFilter,
      sort: sortBy,
      page,
      perPage: 12,
    }),
    staleTime: 0,
    gcTime: 0,
  });

  const activityQuery = useQuery({
    queryKey: ['admin-activity', 'vehicle'],
    queryFn: () => getAdminActivity({ targetType: 'vehicle', limit: 8 }),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter, deferredVehicleSearch, brandFilter, modelFilter, yearFilter, sortBy]);

  useEffect(() => {
    if (!vehiclesQuery.data?.items) {
      return;
    }

    const drafts = {};
    vehiclesQuery.data.items.forEach((vehicle) => {
      drafts[vehicle.id] = vehicle.manual_status_override || 'AUTO';
    });
    setStatusDrafts((current) => ({ ...current, ...drafts }));
  }, [vehiclesQuery.data]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ vehicleId, status }) => updateAdminVehicleStatus(vehicleId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-activity'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'featured'] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'hero-search'] });
      toast.success('Statut véhicule mis à jour');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const vehicles = vehiclesQuery.data?.items || [];
  const pagination = vehiclesQuery.data?.pagination;
  const filterOptions = vehiclesQuery.data?.filters || { brands: [], models: [], years: [] };

  return (
    <AdminShell
      activeTab="vehicles"
      headerActions={(
        <a
          href={createPageUrl('Vehicles')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition-colors font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Voir la page véhicules
        </a>
      )}
    >
      <div className="space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Statut des véhicules</h1>
                <p className="text-sm sm:text-base text-slate-500">Filtres avancés, pagination et lien direct vers la fiche publique.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 mb-6">
            <label className="relative xl:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleSearch}
                onChange={(event) => setVehicleSearch(event.target.value)}
                placeholder="Rechercher Ford Mustang, référence..."
                className="w-full rounded-2xl border border-slate-300 pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="all">Tous statuts</option>
              <option value="Disponible">Disponible</option>
              <option value="Réservé">Réservé</option>
              <option value="Vendu">Vendu</option>
            </select>

            <select
              value={brandFilter}
              onChange={(event) => {
                setBrandFilter(event.target.value);
                setModelFilter('');
              }}
              className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Toutes marques</option>
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={modelFilter}
              onChange={(event) => setModelFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Tous modèles</option>
              {filterOptions.models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Toutes années</option>
              {filterOptions.years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="text-sm text-slate-500">
              {pagination ? `${pagination.total} véhicule(s) trouvé(s)` : 'Chargement...'}
            </div>

            <label className="inline-flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="updated_desc">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="year_desc">Année décroissante</option>
                <option value="year_asc">Année croissante</option>
                <option value="brand_asc">Marque A-Z</option>
              </select>
            </label>
          </div>

          {vehiclesQuery.isLoading ? (
            <div className="text-slate-500">Chargement des véhicules...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-3xl border border-slate-200 p-4 md:p-5 bg-slate-50 overflow-hidden">
                    <div className="flex flex-col gap-4 h-full">
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <img
                          src={vehicle.image_url || DEFAULT_VEHICLE_IMAGE}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full sm:w-28 h-44 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                          onError={(event) => {
                            event.currentTarget.src = DEFAULT_VEHICLE_IMAGE;
                          }}
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeClasses(vehicle.status)}`}>
                              {vehicle.status}
                            </span>
                            {vehicle.manual_override_active && (
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                                Statut forcé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1 break-words">
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

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`${createPageUrl('VehicleDetail')}?id=${vehicle.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir la fiche publique
                        </Link>
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
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          <option value="AUTO">Automatique (Spider)</option>
                          <option value="Disponible">Disponible</option>
                          <option value="Vendu">Vendu</option>
                          <option value="Réservé">Réservé</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = statusDrafts[vehicle.id] || 'AUTO';
                            if (!window.confirm(`Confirmer le changement de statut pour ${vehicle.brand} ${vehicle.model} ?`)) {
                              return;
                            }

                            updateStatusMutation.mutate({
                              vehicleId: vehicle.id,
                              status: nextStatus,
                            });
                          }}
                          disabled={updateStatusMutation.isPending}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold hover:bg-black transition-colors disabled:opacity-60"
                        >
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {!vehicles.length && (
                  <div className="xl:col-span-2 rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                    Aucun véhicule trouvé avec ces filtres.
                  </div>
                )}
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-6">
                  <p className="text-sm text-slate-500">
                    Page {pagination.page} / {pagination.total_pages}
                  </p>
                  <div className="flex w-full md:w-auto items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={pagination.page <= 1}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(pagination.total_pages, current + 1))}
                      disabled={pagination.page >= pagination.total_pages}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <AdminActivityList
          title="Historique véhicules"
          items={activityQuery.data || []}
          emptyMessage="Aucun changement de statut enregistré pour le moment."
        />
      </div>
    </AdminShell>
  );
}
