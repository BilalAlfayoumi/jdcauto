import React from 'react';
import { Link } from 'react-router-dom';
import { Car, FileText } from 'lucide-react';
import AdminShell from '../Components/AdminShell';

export default function AdminLanding() {
  return (
    <AdminShell activeTab={null}>
      <div className="max-w-5xl mx-auto">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Administration JDC Auto</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Choisissez la section a modifier</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Accede directement a la gestion des vehicules ou a la page carte grise.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Link
              to="/admin/vehicles"
              className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-slate-950 hover:bg-white"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Car className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">Nos vehicules</h2>
              <p className="mt-2 text-slate-600">
                Modifier le statut des vehicules, filtrer le stock et ouvrir les fiches publiques.
              </p>
            </Link>

            <Link
              to="/admin/carte-grise"
              className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-slate-950 hover:bg-white"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">Carte grise</h2>
              <p className="mt-2 text-slate-600">
                Modifier les tarifs, les sections documents et les fichiers CERFA.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
