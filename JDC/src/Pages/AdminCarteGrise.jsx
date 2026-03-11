import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import AdminShell from '../Components/AdminShell';
import {
  getCarteGriseContent,
  saveCarteGriseContent,
  uploadCarteGriseFile,
} from '../api/adminClient';
import { cloneCarteGriseContent, defaultCarteGriseContent } from '../data/carteGriseContent';
import { createPageUrl } from '../utils';

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function serializeContent(content) {
  return JSON.stringify(content || {});
}

function formatBytes(bytes) {
  if (!bytes) {
    return 'Taille inconnue';
  }

  if (bytes < 1024) {
    return `${bytes} o`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function isImageFile(path = '') {
  return /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(path);
}

function isPdfFile(path = '', mimeType = '') {
  return mimeType.includes('pdf') || /\.pdf(\?.*)?$/i.test(path);
}

function ActionButton({ onClick, children, tone = 'default', disabled = false }) {
  const toneClasses = {
    default: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border-red-200 bg-white text-red-600 hover:bg-red-50',
    primary: 'border-transparent bg-slate-950 text-white hover:bg-black',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

export default function AdminCarteGrise() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(cloneCarteGriseContent());
  const [uploadingCardId, setUploadingCardId] = useState(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(serializeContent(defaultCarteGriseContent));
  const [selectedPricingIndex, setSelectedPricingIndex] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);

  const contentQuery = useQuery({
    queryKey: ['carte-grise-content'],
    queryFn: getCarteGriseContent,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    const nextContent = cloneCarteGriseContent(contentQuery.data || defaultCarteGriseContent);
    const nextSnapshot = serializeContent(nextContent);

    setContent(nextContent);
    setLastSavedSnapshot(nextSnapshot);
  }, [contentQuery.data]);

  const currentSnapshot = serializeContent(content);
  const isDirty = currentSnapshot !== lastSavedSnapshot;

  useEffect(() => {
    if (selectedPricingIndex !== null && selectedPricingIndex >= content.pricingItems.length) {
      setSelectedPricingIndex(null);
    }
  }, [content.pricingItems.length, selectedPricingIndex]);

  useEffect(() => {
    if (selectedSectionIndex !== null && selectedSectionIndex >= content.documentSections.length) {
      setSelectedSectionIndex(null);
    }
  }, [content.documentSections.length, selectedSectionIndex]);

  useEffect(() => {
    if (selectedPricingIndex === null) {
      return;
    }

    const element = document.getElementById(`pricing-block-${selectedPricingIndex}`);
    if (!element) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [selectedPricingIndex]);

  useEffect(() => {
    if (selectedSectionIndex === null) {
      return;
    }

    const element = document.getElementById(`section-block-${selectedSectionIndex}`);
    if (!element) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [selectedSectionIndex]);

  const saveMutation = useMutation({
    mutationFn: () => saveCarteGriseContent(content),
    onSuccess: async (saved) => {
      const normalizedContent = cloneCarteGriseContent(saved.content || content);
      const nextSnapshot = serializeContent(normalizedContent);

      setContent(normalizedContent);
      setLastSavedSnapshot(nextSnapshot);
      setSelectedPricingIndex(null);
      setSelectedSectionIndex(null);

      await queryClient.invalidateQueries({ queryKey: ['carte-grise-content'] });
      await queryClient.invalidateQueries({ queryKey: ['carte-grise-pricing'] });
      toast.success('Contenu carte grise enregistré');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCarteGriseFile,
    onSuccess: () => {
      toast.success('Fichier CERFA importé');
      setUploadingCardId(null);
    },
    onError: (error) => {
      setUploadingCardId(null);
      toast.error(error.message);
    },
  });

  const updatePricingItem = (index, key, value) => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.pricingItems[index][key] = value;
      return next;
    });
  };

  const movePricingItem = (index, direction) => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      const swapIndex = index + direction;
      if (swapIndex < 0 || swapIndex >= next.pricingItems.length) {
        return current;
      }
      [next.pricingItems[index], next.pricingItems[swapIndex]] = [next.pricingItems[swapIndex], next.pricingItems[index]];
      return next;
    });
    if (selectedPricingIndex === index) {
      setSelectedPricingIndex(index + direction);
    }
  };

  const addPricingItem = () => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.pricingItems.push({
        id: createId('pricing'),
        title: 'Nouveau tarif',
        subtitle: '',
        price: '',
        note: 'TTC',
        popular: false,
      });
      return next;
    });
    setSelectedPricingIndex(content.pricingItems.length);
  };

  const removePricingItem = (index) => {
    if (!window.confirm('Supprimer ce bloc tarifaire ?')) {
      return;
    }
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.pricingItems = next.pricingItems.filter((_, itemIndex) => itemIndex !== index);
      return next;
    });
    setSelectedPricingIndex(null);
  };

  const updateSection = (sectionIndex, updates) => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.documentSections[sectionIndex] = {
        ...next.documentSections[sectionIndex],
        ...updates,
      };
      return next;
    });
  };

  const moveSection = (sectionIndex, direction) => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      const swapIndex = sectionIndex + direction;
      if (swapIndex < 0 || swapIndex >= next.documentSections.length) {
        return current;
      }
      [next.documentSections[sectionIndex], next.documentSections[swapIndex]] = [next.documentSections[swapIndex], next.documentSections[sectionIndex]];
      return next;
    });
    if (selectedSectionIndex === sectionIndex) {
      setSelectedSectionIndex(sectionIndex + direction);
    }
  };

  const addSection = () => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.documentSections.push({
        id: createId('section'),
        title: 'Nouvelle section',
        items: [],
        infoText: '',
        cerfaTitle: '',
        cerfaCards: [],
      });
      return next;
    });
    setSelectedSectionIndex(content.documentSections.length);
  };

  const removeSection = (sectionIndex) => {
    if (!window.confirm('Supprimer entièrement cette section ?')) {
      return;
    }
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.documentSections = next.documentSections.filter((_, index) => index !== sectionIndex);
      return next;
    });
    setSelectedSectionIndex(null);
  };

  const updateCerfaCard = (sectionIndex, cardIndex, key, value) => {
    setContent((current) => {
      const next = cloneCarteGriseContent(current);
      next.documentSections[sectionIndex].cerfaCards[cardIndex][key] = value;
      return next;
    });
  };

  const handleUpload = async (sectionIndex, cardIndex, file) => {
    if (!file) {
      return;
    }

    const currentCard = content.documentSections[sectionIndex].cerfaCards[cardIndex];
    if (currentCard.fileUrl && !window.confirm(`Remplacer le fichier actuel de "${currentCard.title}" ?`)) {
      return;
    }

    setUploadingCardId(currentCard.id);
    const uploaded = await uploadMutation.mutateAsync(file);
    updateCerfaCard(sectionIndex, cardIndex, 'fileUrl', uploaded.public_url);
    updateCerfaCard(sectionIndex, cardIndex, 'fileMeta', {
      mimeType: uploaded.mime_type || '',
      size: uploaded.size || 0,
      extension: uploaded.extension || '',
      isImage: Boolean(uploaded.is_image),
    });
    if (!currentCard.downloadFilename) {
      updateCerfaCard(sectionIndex, cardIndex, 'downloadFilename', uploaded.filename);
    }
  };

  const stats = useMemo(() => ({
    pricing: content.pricingItems.length,
    sections: content.documentSections.length,
    cerfas: content.documentSections.reduce((sum, section) => sum + (section.cerfaCards?.length || 0), 0),
  }), [content]);

  return (
    <AdminShell
      activeTab="carte-grise"
      headerActions={(
        <a
          href={createPageUrl('Administrative')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition-colors font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir la vraie page
        </a>
      )}
    >
      <div className="space-y-8">
        <section className="rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-red-50 p-4 sm:p-6 shadow-xl border border-slate-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Mode edition visuelle
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold text-slate-950">Carte grise & demarches administratives</h1>
              <p className="mt-3 text-slate-600">
                Tu modifies la page directement dans sa mise en forme publique. Clique sur un bloc pour l’éditer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-full sm:min-w-[360px]">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Tarifs</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.pricing}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sections</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.sections}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">CERFA</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.cerfas}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isDirty ? 'bg-amber-300 text-amber-950' : 'bg-emerald-300 text-emerald-950'
            }`}>
              {isDirty ? 'Modifications non enregistrées' : 'Page à jour'}
            </span>
            <ActionButton tone="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !isDirty}>
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer la page'}
            </ActionButton>
          </div>
        </section>

        <div className="bg-gray-50 rounded-[32px] overflow-hidden shadow-lg border border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
            <section className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8 sm:mb-12">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nos tarifs transparents</h2>
                  <p className="mt-2 text-gray-600">Clique sur une carte pour la modifier directement.</p>
                </div>
                <ActionButton onClick={addPricingItem}>
                  <Plus className="w-4 h-4" />
                  Ajouter un bloc tarifaire
                </ActionButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.pricingItems.map((item, index) => (
                  <div
                    id={`pricing-block-${index}`}
                    key={item.id}
                    className={`border-2 rounded-lg p-4 sm:p-6 transition-all ${
                      item.popular ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-600'
                    } ${selectedPricingIndex === index ? 'ring-4 ring-red-100' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        {item.popular && (
                          <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                            POPULAIRE
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title || 'Sans titre'}</h3>
                        {item.subtitle && (
                          <p className="text-sm text-gray-600 mb-3">{item.subtitle}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <ActionButton onClick={() => setSelectedPricingIndex(selectedPricingIndex === index ? null : index)}>
                          {selectedPricingIndex === index ? 'Fermer' : 'Modifier'}
                        </ActionButton>
                        <ActionButton onClick={() => movePricingItem(index, -1)} disabled={index === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </ActionButton>
                        <ActionButton onClick={() => movePricingItem(index, 1)} disabled={index === content.pricingItems.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </ActionButton>
                        <ActionButton tone="danger" onClick={() => removePricingItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </ActionButton>
                      </div>
                    </div>

                    {selectedPricingIndex === index ? (
                      <div className="space-y-4 rounded-3xl border-2 border-dashed border-red-200 bg-white/80 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block md:col-span-2">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Identifiant technique</span>
                            <input
                              type="text"
                              value={item.id}
                              onChange={(event) => updatePricingItem(index, 'id', event.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Titre</span>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(event) => updatePricingItem(index, 'title', event.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Sous-titre</span>
                            <textarea
                              rows={3}
                              value={item.subtitle}
                              onChange={(event) => updatePricingItem(index, 'subtitle', event.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Prix</span>
                            <input
                              type="text"
                              value={item.price}
                              onChange={(event) => updatePricingItem(index, 'price', event.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Note</span>
                            <input
                              type="text"
                              value={item.note}
                              onChange={(event) => updatePricingItem(index, 'note', event.target.value)}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>
                          <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={Boolean(item.popular)}
                              onChange={(event) => updatePricingItem(index, 'popular', event.target.checked)}
                              className="h-4 w-4 accent-red-600"
                            />
                            <span className="text-sm font-semibold text-slate-700">Afficher le badge POPULAIRE</span>
                          </label>
                        </div>

                        <div className="flex justify-end">
                          <ActionButton tone="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                            <Save className="w-4 h-4" />
                            {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                          </ActionButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-red-600 mb-1">{item.price || '0€'}</div>
                        <p className="text-sm text-gray-600">{item.note || 'TTC'}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-12">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Documents nécessaires pour l'élaboration d'une carte grise</h2>
                  <p className="mt-2 text-gray-600">Même principe : clique sur une section pour la modifier en dessous.</p>
                </div>
                <ActionButton onClick={addSection}>
                  <Plus className="w-4 h-4" />
                  Ajouter une section
                </ActionButton>
              </div>

              {content.documentSections.map((section, sectionIndex) => (
                <div key={section.id} className={sectionIndex < content.documentSections.length - 1 ? 'mb-8' : ''}>
                  <div
                    id={`section-block-${sectionIndex}`}
                    className={`rounded-xl ${selectedSectionIndex === sectionIndex ? 'ring-4 ring-red-100' : ''}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-7 h-7 text-red-600" />
                        {section.title || `Section ${sectionIndex + 1}`}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        <ActionButton onClick={() => setSelectedSectionIndex(selectedSectionIndex === sectionIndex ? null : sectionIndex)}>
                          {selectedSectionIndex === sectionIndex ? 'Fermer' : 'Modifier'}
                        </ActionButton>
                        <ActionButton onClick={() => moveSection(sectionIndex, -1)} disabled={sectionIndex === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </ActionButton>
                        <ActionButton onClick={() => moveSection(sectionIndex, 1)} disabled={sectionIndex === content.documentSections.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </ActionButton>
                        <ActionButton tone="danger" onClick={() => removeSection(sectionIndex)}>
                          <Trash2 className="w-4 h-4" />
                        </ActionButton>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
                      {selectedSectionIndex === sectionIndex ? (
                        <div className="space-y-5 rounded-3xl border-2 border-dashed border-red-200 bg-white/80 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="block">
                              <span className="block text-sm font-semibold text-slate-700 mb-2">Titre de section</span>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(event) => updateSection(sectionIndex, { title: event.target.value })}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                              />
                            </label>
                            <label className="block">
                              <span className="block text-sm font-semibold text-slate-700 mb-2">Titre du bloc CERFA</span>
                              <input
                                type="text"
                                value={section.cerfaTitle || ''}
                                onChange={(event) => updateSection(sectionIndex, { cerfaTitle: event.target.value })}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Liste des documents</span>
                            <textarea
                              rows={6}
                              value={(section.items || []).join('\n')}
                              onChange={(event) => updateSection(sectionIndex, {
                                items: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                              })}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>

                          <label className="block">
                            <span className="block text-sm font-semibold text-slate-700 mb-2">Encadré d'information</span>
                            <textarea
                              rows={4}
                              value={section.infoText || ''}
                              onChange={(event) => updateSection(sectionIndex, { infoText: event.target.value })}
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </label>

                          <div className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h4 className="font-bold text-slate-900">CERFA de cette section</h4>
                                <p className="text-sm text-slate-500">Les documents restent directement dans ce bloc.</p>
                              </div>
                              <ActionButton
                                onClick={() => updateSection(sectionIndex, {
                                  cerfaCards: [
                                    ...(section.cerfaCards || []),
                                    {
                                      id: createId('cerfa'),
                                      title: 'Nouveau CERFA',
                                      badge: '',
                                      fileUrl: '',
                                      downloadFilename: '',
                                      fileMeta: {
                                        mimeType: '',
                                        size: 0,
                                        extension: '',
                                        isImage: false,
                                      },
                                    },
                                  ],
                                })}
                              >
                                <Plus className="w-4 h-4" />
                                Ajouter un CERFA
                              </ActionButton>
                            </div>

                            <div className="space-y-4">
                              {(section.cerfaCards || []).map((card, cardIndex) => {
                                const mimeType = card.fileMeta?.mimeType || '';
                                const imagePreview = Boolean(card.fileMeta?.isImage) || isImageFile(card.fileUrl);
                                const pdfPreview = isPdfFile(card.fileUrl, mimeType);

                                return (
                                  <div key={card.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px]">
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <label className="block">
                                            <span className="block text-sm font-semibold text-slate-700 mb-2">Titre</span>
                                            <input
                                              type="text"
                                              value={card.title}
                                              onChange={(event) => updateCerfaCard(sectionIndex, cardIndex, 'title', event.target.value)}
                                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                                            />
                                          </label>
                                          <label className="block">
                                            <span className="block text-sm font-semibold text-slate-700 mb-2">Badge</span>
                                            <input
                                              type="text"
                                              value={card.badge}
                                              onChange={(event) => updateCerfaCard(sectionIndex, cardIndex, 'badge', event.target.value)}
                                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                                            />
                                          </label>
                                        </div>

                                        <label className="block">
                                          <span className="block text-sm font-semibold text-slate-700 mb-2">Nom du fichier téléchargé</span>
                                          <input
                                            type="text"
                                            value={card.downloadFilename}
                                            onChange={(event) => updateCerfaCard(sectionIndex, cardIndex, 'downloadFilename', event.target.value)}
                                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                                          />
                                        </label>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                          <p className="text-sm font-semibold text-slate-700">Fichier actuel</p>
                                          <p className="mt-1 break-all text-sm text-slate-500">{card.fileUrl || 'Aucun fichier'}</p>
                                          <p className="mt-2 text-sm text-slate-500">{formatBytes(card.fileMeta?.size)} • {mimeType || 'Type inconnu'}</p>
                                          <div className="mt-4 flex flex-wrap gap-2">
                                            {card.fileUrl && (
                                              <>
                                                <a
                                                  href={card.fileUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                  <ExternalLink className="w-4 h-4" />
                                                  Voir
                                                </a>
                                                <a
                                                  href={card.fileUrl}
                                                  download={card.downloadFilename || undefined}
                                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                  <Download className="w-4 h-4" />
                                                  Télécharger
                                                </a>
                                              </>
                                            )}
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-black">
                                              <Upload className="w-4 h-4" />
                                              {uploadingCardId === card.id ? 'Import...' : 'Remplacer'}
                                              <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.webp,.pdf"
                                                className="hidden"
                                                onChange={(event) => handleUpload(sectionIndex, cardIndex, event.target.files?.[0])}
                                              />
                                            </label>
                                            <ActionButton
                                              tone="danger"
                                              onClick={() => {
                                                if (!window.confirm('Supprimer ce CERFA ?')) {
                                                  return;
                                                }
                                                updateSection(sectionIndex, {
                                                  cerfaCards: section.cerfaCards.filter((_, index) => index !== cardIndex),
                                                });
                                              }}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                              Supprimer
                                            </ActionButton>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="rounded-3xl border border-slate-200 bg-white p-3">
                                        <p className="text-sm font-semibold text-slate-700 mb-3">Aperçu</p>
                                        <div className="h-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                          {card.fileUrl ? (
                                            imagePreview ? (
                                              <img src={card.fileUrl} alt={card.title} className="w-full h-full object-contain" />
                                            ) : pdfPreview ? (
                                              <iframe
                                                src={`${card.fileUrl}#toolbar=0&navpanes=0`}
                                                title={card.title}
                                                className="w-full h-full bg-white"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                Aperçu indisponible
                                              </div>
                                            )
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                              Aucun fichier
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {!section.cerfaCards?.length && (
                                <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-8 text-center text-slate-500">
                                  Aucun CERFA dans cette section.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <ActionButton tone="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                              <Save className="w-4 h-4" />
                              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                            </ActionButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          {(section.items || []).map((item, itemIndex) => (
                            <div key={`${section.id}-item-${itemIndex}`} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}

                          {section.infoText && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                              <p className="text-sm text-blue-800">{section.infoText}</p>
                            </div>
                          )}

                          {(section.cerfaCards || []).length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-300">
                              {section.cerfaTitle && (
                                <p className="font-semibold text-gray-900 mb-4">{section.cerfaTitle}</p>
                              )}
                              <div className={`grid grid-cols-1 ${(section.cerfaCards || []).length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                                {section.cerfaCards.map((card) => (
                                  <div key={card.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3 gap-3">
                                      <h4 className="font-semibold text-gray-900">{card.title}</h4>
                                      {card.badge && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{card.badge}</span>
                                      )}
                                    </div>
                                    <div className="w-full h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                                      {card.fileUrl && isImageFile(card.fileUrl) ? (
                                        <img src={card.fileUrl} alt={card.title} className="w-full h-full object-contain" />
                                      ) : (
                                        <FileText className="w-10 h-10 text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
