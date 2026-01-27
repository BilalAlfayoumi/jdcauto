import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import ProgressBar from '../Components/ProgressBar';
import AnimatedSection from '../Components/AnimatedSection';
import { useParallax } from '../hooks/useParallax';
import { 
  Car, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Shield,
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
  FileText,
  DollarSign,
  ArrowRight,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function TradeIn() {
  const [currentStep, setCurrentStep] = useState(0);
  const formSectionRef = useRef(null);
  const { opacity, translateY } = useParallax();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const [formData, setFormData] = useState({
    // Step 0: Vehicle details
    brand: '',
    model: '',
    version: '',
    year: new Date().getFullYear(),
    mileage: '',
    fuelType: '',
    // Step 1: Project
    sellDelay: '',
    buyingProject: '',
    // Step 2: Personal info
    civility: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    // Step 3: Consent
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);

  const steps = [
    'Détails véhicule',
    'Votre projet',
    'Coordonnées',
    'Validation'
  ];

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.TradeIn.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Votre demande a été envoyée avec succès !');
    },
    onError: () => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNext = () => {
    // Validation per step
    if (currentStep === 0) {
      if (!formData.brand || !formData.model || !formData.year || !formData.mileage) {
        toast.error('Veuillez compléter tous les champs obligatoires');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        toast.error('Veuillez compléter tous les champs obligatoires');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.consent) {
        toast.error('Veuillez accepter les conditions');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Demande envoyée avec succès !</h2>
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre demande d'estimation. Notre équipe d'experts va l'examiner et vous recontacter sous <strong>48 heures</strong> avec une offre personnalisée.
          </p>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Prochaines étapes :</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">1.</span>
                <span>Analyse complète de votre véhicule par nos experts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">2.</span>
                <span>Estimation au meilleur prix du marché</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">3.</span>
                <span>Prise de contact par téléphone ou email</span>
              </li>
            </ul>
          </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setFormData({
                  brand: '',
                  model: '',
                  version: '',
                  year: new Date().getFullYear(),
                  mileage: '',
                  fuelType: '',
                  sellDelay: '',
                  buyingProject: '',
                  civility: '',
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  message: '',
                  consent: false
                });
              }}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
            >
              Faire une nouvelle estimation
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section avec image dynamique et effets de scroll */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Image de fond avec effets de parallaxe et fade-out */}
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
            opacity: isLoaded ? opacity : 0,
            transform: isLoaded ? `translateY(${translateY}px) scale(1)` : 'translateY(0px) scale(1.1)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            willChange: 'opacity, transform'
          }}
        >
          {/* Overlay gradient pour améliorer la lisibilité */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 transition-opacity duration-1000"
            style={{
              opacity: isLoaded ? 1 : 0
            }}
          />
        </div>

        {/* Contenu hero */}
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
                Reprise de votre voiture au meilleur prix
              </h1>
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-10 font-light transition-all duration-1000 ease-out"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
                }}
              >
                Estimation rapide, gratuite, sans engagement
              </p>
              <button
                onClick={scrollToForm}
                className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-3 text-lg shadow-2xl hover:shadow-red-500/50"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s',
                  animation: isLoaded ? 'pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s' : 'none'
                }}
              >
                Estimer mon véhicule
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <ChevronRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </div>

      {/* Section formulaire d'estimation */}
      <div ref={formSectionRef} className="max-w-5xl mx-auto px-4 py-16 md:py-24 -mt-20 relative z-20">
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 lg:p-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Estimation en 2 minutes
              </h2>
              <p className="text-lg text-gray-600">
                Remplissez le formulaire ci-dessous pour recevoir une estimation personnalisée
              </p>
            </div>

            <ProgressBar steps={steps} currentStep={currentStep} />

            <form onSubmit={handleSubmit} className="mt-10">
              {/* Step 0: Vehicle Details */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Détails de votre véhicule
                    </h3>
                    <p className="text-gray-600">
                      Vérifiez et complétez les informations
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Marque *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        required
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Ex: Renault"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Modèle *
                      </label>
                      <input
                        type="text"
                        name="model"
                        required
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Ex: Clio"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Version / Finition
                      </label>
                      <input
                        type="text"
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Ex: Intens"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Année *
                      </label>
                      <input
                        type="number"
                        name="year"
                        required
                        min="1980"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kilométrage *
                      </label>
                      <input
                        type="number"
                        name="mileage"
                        required
                        value={formData.mileage}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="Ex: 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Carburant
                      </label>
                      <select
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Essence">Essence</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybride">Hybride</option>
                        <option value="Électrique">Électrique</option>
                        <option value="GPL">GPL</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Project */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Votre projet
                    </h3>
                    <p className="text-gray-600">
                      Aidez-nous à mieux comprendre vos besoins
                    </p>
                  </div>

                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dans quel délai souhaitez-vous vendre ?
                      </label>
                      <select
                        name="sellDelay"
                        value={formData.sellDelay}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner</option>
                        <option value="immédiatement">Immédiatement</option>
                        <option value="1-semaine">Dans la semaine</option>
                        <option value="1-mois">Dans le mois</option>
                        <option value="3-mois">Dans 3 mois</option>
                        <option value="flexible">Je suis flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Avez-vous un projet d'achat d'un nouveau véhicule ?
                      </label>
                      <select
                        name="buyingProject"
                        value={formData.buyingProject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      >
                        <option value="">Sélectionner</option>
                        <option value="oui-immédiat">Oui, immédiatement</option>
                        <option value="oui-futur">Oui, dans le futur</option>
                        <option value="non">Non</option>
                        <option value="indécis">Je ne sais pas encore</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Vos coordonnées
                    </h3>
                    <p className="text-gray-600">
                      Pour recevoir votre estimation personnalisée
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Civilité
                      </label>
                      <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="civility"
                            value="M"
                            checked={formData.civility === 'M'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`px-4 py-3 border-2 rounded-lg text-center font-medium transition-all ${
                            formData.civility === 'M' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-300 hover:border-gray-400'
                          }`}>
                            M.
                          </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="radio"
                            name="civility"
                            value="Mme"
                            checked={formData.civility === 'Mme'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`px-4 py-3 border-2 rounded-lg text-center font-medium transition-all ${
                            formData.civility === 'Mme' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-300 hover:border-gray-400'
                          }`}>
                            Mme
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          required
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Informations complémentaires
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        placeholder="État du véhicule, équipements, historique..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Consent */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      Dernière étape
                    </h3>
                    <p className="text-gray-600">
                      Validez votre demande d'estimation
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Véhicule:</strong> {formData.brand} {formData.model} {formData.version}</p>
                      <p><strong>Année:</strong> {formData.year}</p>
                      <p><strong>Kilométrage:</strong> {formData.mileage} km</p>
                      <p><strong>Contact:</strong> {formData.first_name} {formData.last_name}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      J'accepte que mes données soient utilisées par JDC AUTO pour me recontacter dans le cadre d'une relation commerciale. 
                      Je peux exercer mes droits d'accès, de rectification et de suppression en contactant JDC AUTO.
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-6 border-t">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Précédent
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="ml-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {mutation.isPending ? 'Envoi...' : 'Valider et recevoir estimation'}
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </AnimatedSection>
      </div>

      {/* Section "Pourquoi nous choisir" */}
      <div className="bg-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Pourquoi nous choisir ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                La meilleure façon de vendre votre véhicule en toute confiance
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: TrendingUp, 
                title: 'Reprise au meilleur prix', 
                desc: 'Cotation au prix du marché, garantie du meilleur prix',
                color: 'bg-red-100 text-red-600',
                delay: 0
              },
              { 
                icon: Shield, 
                title: 'Transactions garanties', 
                desc: 'Sécurité totale de A à Z, processus transparent et sécurisé',
                color: 'bg-blue-100 text-blue-600',
                delay: 100
              },
              { 
                icon: Zap, 
                title: 'Vente rapide', 
                desc: 'Réponse sous 48h maximum, processus simplifié',
                color: 'bg-yellow-100 text-yellow-600',
                delay: 200
              },
              { 
                icon: Award, 
                title: 'Processus simplifié', 
                desc: 'On s\'occupe de tout, démarches facilitées',
                color: 'bg-green-100 text-green-600',
                delay: 300
              }
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={item.delay}>
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center group border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${item.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      {/* Section "Notre fonctionnement" - Timeline */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Notre fonctionnement
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Un processus simple et transparent en 3 étapes
              </p>
            </div>
          </AnimatedSection>

          <div className="relative">
            {/* Ligne de connexion (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-700 transform -translate-y-1/2 z-0">
              <div className="h-full bg-red-600 w-0 transition-all duration-1000" style={{ width: '100%' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              {[
                {
                  number: '1',
                  icon: Search,
                  title: 'Estimation rapide du véhicule',
                  desc: 'Remplissez notre formulaire en 2 minutes et recevez une estimation personnalisée de votre véhicule par nos experts.',
                  delay: 0
                },
                {
                  number: '2',
                  icon: FileText,
                  title: 'Cotation juste et transparente',
                  desc: 'Nos experts analysent votre véhicule et vous proposent une cotation au meilleur prix du marché, sans frais cachés.',
                  delay: 200
                },
                {
                  number: '3',
                  icon: Car,
                  title: 'Achat du nouveau véhicule',
                  desc: 'Finalisez votre achat en toute sérénité avec notre accompagnement personnalisé et nos services additionnels.',
                  delay: 400
                }
              ].map((item, index) => (
                <AnimatedSection key={index} animation="fade-up" delay={item.delay}>
                  <div className="relative text-center">
                    {/* Numéro de l'étape */}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6 shadow-lg z-10">
                      <span className="text-3xl font-bold">{item.number}</span>
                    </div>
                    
                    {/* Icône */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section conversion finale avec image animée et animations pop au scroll */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 md:py-28">
        {/* Image de fond animée */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
              animation: 'zoomInOut 20s ease-in-out infinite',
              transformOrigin: 'center center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu texte */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <AnimatedSection animation="pop" delay={0}>
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-semibold text-red-400 backdrop-blur-sm">
                    Estimation gratuite
                  </span>
                </div>
              </AnimatedSection>

              {/* Titre */}
              <AnimatedSection animation="pop" delay={100}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Vendez votre voiture au <span className="text-red-500">meilleur prix</span>
                </h2>
              </AnimatedSection>

              {/* Description */}
              <AnimatedSection animation="pop" delay={200}>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Obtenez une estimation en 2 minutes. Réponse sous 48h. Meilleur prix garanti. Gratuit et sans engagement.
                </p>
              </AnimatedSection>
              
              {/* Boutons */}
              <AnimatedSection animation="pop" delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={scrollToForm}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-3 text-lg shadow-2xl hover:shadow-red-500/50"
                  >
                    Estimer mon véhicule
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollToForm}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-3 text-lg"
                  >
                    <DollarSign className="w-5 h-5" />
                    Rachat cash
                  </button>
                </div>
              </AnimatedSection>

              {/* Points de confiance */}
              <AnimatedSection animation="pop" delay={400}>
                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Gratuit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Sans engagement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Réponse 48h</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Image animée */}
            <AnimatedSection animation="pop" delay={200} className="relative">
              <div className="relative">
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    animation: 'float 6s ease-in-out infinite'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"
                    alt="Véhicule d'occasion"
                    className="w-full h-[400px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                {/* Éléments décoratifs animés */}
                <div 
                  className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl"
                  style={{
                    animation: 'pulse 3s ease-in-out infinite'
                  }}
                />
                <div 
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
                  style={{
                    animation: 'pulse 4s ease-in-out infinite'
                  }}
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}
