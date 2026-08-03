import React from 'react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Admin indisponible</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">L’espace admin a rencontré une erreur.</h1>
            <p className="mt-3 text-slate-600">
              Recharge la page. Si le probleme continue, contacte le developpeur avec ce message:
            </p>
            <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white break-words">
              {this.state.errorMessage || 'Erreur JavaScript inconnue'}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-black transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
