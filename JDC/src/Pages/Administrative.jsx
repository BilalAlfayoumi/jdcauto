import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useParallax } from '../hooks/useParallax';
import AnimatedSection from '../Components/AnimatedSection';
import { getCarteGriseContent } from '../api/adminClient';
import { defaultCarteGriseContent } from '../data/carteGriseContent';
import { 
  FileText, 
  CheckCircle,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  Download,
  X,
  ZoomIn,
  ExternalLink
} from 'lucide-react';

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

function isImageFile(path = '') {
  const lower = path.toLowerCase();
  return imageExtensions.some((extension) => lower.endsWith(extension));
}

export default function Administrative() {
  const { opacity, translateY } = useParallax();
  const [isLoaded, setIsLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const { data: contentData } = useQuery({
    queryKey: ['carte-grise-content'],
    queryFn: getCarteGriseContent,
    staleTime: 0,
    cacheTime: 0,
  });

  const carteGriseContent = contentData || defaultCarteGriseContent;
  const pricingItems = carteGriseContent.pricingItems || defaultCarteGriseContent.pricingItems;
  const documentSections = carteGriseContent.documentSections || defaultCarteGriseContent.documentSections;

  // Fonction pour ouvrir le lightbox
  const openLightbox = (imagePath, title) => {
    setLightboxImage(imagePath);
    setLightboxTitle(title);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Fonction pour fermer le lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
    setLightboxTitle('');
    document.body.style.overflow = 'unset';
  };

  // Navigation clavier pour le lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  // Fonction pour télécharger une image
  const downloadImage = (imagePath, filename) => {
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
          style={{
            backgroundImage: 'url(/jdcauto-2.jpg)',
            opacity: isLoaded ? opacity : 0,
            transform: isLoaded ? `translateY(${translateY}px) scale(1)` : 'translateY(0px) scale(1.1)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            willChange: 'opacity, transform'
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 transition-opacity duration-1000"
            style={{
              opacity: isLoaded ? 1 : 0
            }}
          />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div 
              className="max-w-4xl mx-auto transition-all duration-1000 ease-out"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(30px)',
                transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s'
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Carte grise & démarches administratives
              </h1>
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-10 font-light transition-all duration-1000 ease-out"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
                }}
              >
                Service Express - 15 minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction avec horaires et contact */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatedSection animation="fade-up">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 md:p-8 mb-8 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div>
                    <p className="font-semibold text-lg">Horaires d'ouverture</p>
                    <p className="text-red-100">
                      Lundi : 14h - 19h30<br />
                      Mardi au jeudi : 9H - 12h et 14h - 17h30<br />
                      Vendredi : 9H - 13h
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <a 
                    href="tel:+33981369814"
                    className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-5 h-5" />
                    +33 9 81 36 98 14
                  </a>
                  <a 
                    href="mailto:jdcauto.cartegrise@orange.fr"
                    className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    jdcauto.cartegrise@orange.fr
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>


        {/* Tarifs */}
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Nos tarifs transparents
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pricingItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={`border-2 ${item.popular ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-600'} rounded-lg p-6 transition-colors`}
                  >
                    {item.popular && (
                      <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        POPULAIRE
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 mb-3">{item.subtitle}</p>
                    )}
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {item.price.includes('€') ? (
                        (() => {
                          const [euros, centimes] = item.price.split('€');
                          return (
                            <>
                              {euros}€<span className="text-xl">{centimes}</span>
                            </>
                          );
                        })()
                      ) : (
                        item.price
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Professionnel habilité & agréé MINISTÈRE DE L'INTÉRIEUR</strong>
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Documents nécessaires */}
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Documents nécessaires pour l'élaboration d'une carte grise
            </h2>
            
            {documentSections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className={sectionIndex < documentSections.length - 1 ? 'mb-8' : ''}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-red-600" />
                  {section.title}
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {(section.items || []).map((item, itemIndex) => (
                    <div key={`${section.id || sectionIndex}-item-${itemIndex}`} className="flex items-start gap-3">
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
                        {section.cerfaCards.map((card) => {
                          const imageFile = isImageFile(card.fileUrl);
                          const fallbackName = card.downloadFilename || `${card.title || 'cerfa'}.jpg`;

                          return (
                            <div key={card.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-red-600 transition-colors">
                              <div className="flex items-center justify-between mb-3 gap-3">
                                <h4 className="font-semibold text-gray-900">{card.title}</h4>
                                {card.badge && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{card.badge}</span>
                                )}
                              </div>
                              <div className="relative mb-3">
                                {imageFile ? (
                                  <>
                                    <img
                                      src={card.fileUrl}
                                      alt={card.title}
                                      className="w-full h-48 object-contain rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity bg-gray-50"
                                      onClick={() => openLightbox(card.fileUrl, card.title)}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden w-full h-48 bg-gray-100 rounded border border-gray-200 items-center justify-center">
                                      <FileText className="w-12 h-12 text-gray-400" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-48 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                      <FileText className="w-12 h-12 mx-auto mb-2" />
                                      <p className="text-sm">Aperçu non disponible</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {imageFile ? (
                                  <button
                                    onClick={() => openLightbox(card.fileUrl, card.title)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                  >
                                    <ZoomIn className="w-4 h-4" />
                                    Agrandir
                                  </button>
                                ) : (
                                  <a
                                    href={card.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Ouvrir
                                  </a>
                                )}
                                <button
                                  onClick={() => downloadImage(card.fileUrl, fallbackName)}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection animation="fade-up">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Besoin d'aide pour vos démarches ?
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Notre équipe est à votre disposition pour vous accompagner
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to={createPageUrl('Contact')}
                className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 font-semibold rounded-md transition-colors inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Nous contacter
              </Link>
              <a
                href="tel:+33981369814"
                className="px-8 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Phone className="w-5 h-5" />
                +33 9 81 36 98 14
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-semibold">{lightboxTitle}</h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(lightboxImage, lightboxTitle.replace(/\s+/g, '-') + '.jpg');
                  }}
                  className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-2 bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Image */}
            <div 
              className="flex-1 overflow-auto flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt={lightboxTitle}
                className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
