import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  Car,
  FileText,
  ArrowRight,
  ChevronRight,
  Star,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import AnimatedSection from '../Components/AnimatedSection';
import { useParallax } from '../hooks/useParallax';
import { createPageUrl } from '../utils';

export default function Contact() {
  const [formDataAchat, setFormDataAchat] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    type: 'achat',
    consent: false
  });

  const [formDataCarteGrise, setFormDataCarteGrise] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    type: 'carte_grise',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState(null);
  const { opacity, translateY } = useParallax();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  // reCAPTCHA refs
  const recaptchaRefAchat = useRef(null);
  const recaptchaRefCarteGrise = useRef(null);
  
  // Clé reCAPTCHA (à remplacer par votre clé de site)
  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Clé de test Google (à remplacer)

  useEffect(() => {
    setIsLoaded(true);
    // Initialiser EmailJS avec la Public Key
    emailjs.init('AQaaMiMFeiYBqPjIr');
  }, []);

  // Configuration EmailJS
  // ✅ Service Gmail configuré (service_uxxnivr)
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_uxxnivr', // Service Gmail
    TEMPLATE_ID_ACHAT: 'template_sq3rlfb', // Template pour achat
    TEMPLATE_ID_CARTE_GRISE: 'template_sq3rlfb', // Template pour carte grise (même template)
    PUBLIC_KEY: 'AQaaMiMFeiYBqPjIr' // ✅ Public Key configurée
  };

  // Fonction pour envoyer via EmailJS
  const sendEmailViaEmailJS = async (data, templateId) => {
    try {
      // Initialiser EmailJS
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      const templateParams = {
        from_name: `${data.first_name} ${data.last_name}`,
        from_email: data.email,
        phone: data.phone,
        message: data.message,
        subject: data.subject || 'Demande de contact',
        type: data.type === 'achat' ? 'Achat de véhicule' : 'Carte grise & Immatriculation',
        to_email: 'jdcauto33@orange.fr' // Email de destination JDC Auto
      };

      console.log('📧 Envoi EmailJS avec:', {
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: templateId,
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 5) + '...',
        params: templateParams
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        templateId,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log('✅ EmailJS envoyé avec succès:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Erreur EmailJS détaillée:', {
        message: error.text || error.message,
        status: error.status,
        fullError: error
      });
      
      // Afficher un message d'erreur plus détaillé
      if (error.status === 412) {
        throw new Error('Erreur de configuration EmailJS. Vérifiez que le Service ID et Template ID sont corrects.');
      } else if (error.status === 400) {
        throw new Error('Paramètres invalides. Vérifiez que toutes les variables du template sont fournies.');
      } else {
        throw new Error(`Erreur EmailJS: ${error.text || error.message || 'Erreur inconnue'}`);
      }
    }
  };

  const mutationAchat = useMutation({
    mutationFn: async (data) => {
      // Envoyer via EmailJS
      await sendEmailViaEmailJS(data, EMAILJS_CONFIG.TEMPLATE_ID_ACHAT);
      
      // Optionnel: Enregistrer aussi en base de données
      try {
        await base44.entities.ContactRequest.create(data);
      } catch (dbError) {
        console.warn('Erreur enregistrement BDD (non bloquant):', dbError);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setSubmitted(true);
      setSubmittedType('achat');
      toast.success('Message envoyé avec succès ! Notre équipe vous contactera bientôt.');
    },
    onError: (error) => {
      console.error('Erreur envoi:', error);
      const errorMessage = error?.message || 'Une erreur est survenue. Veuillez réessayer.';
      toast.error(errorMessage);
    }
  });

  const mutationCarteGrise = useMutation({
    mutationFn: async (data) => {
      // Envoyer via EmailJS
      await sendEmailViaEmailJS(data, EMAILJS_CONFIG.TEMPLATE_ID_CARTE_GRISE);
      
      // Optionnel: Enregistrer aussi en base de données
      try {
        await base44.entities.ContactRequest.create(data);
      } catch (dbError) {
        console.warn('Erreur enregistrement BDD (non bloquant):', dbError);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setSubmitted(true);
      setSubmittedType('carte_grise');
      toast.success('Message envoyé avec succès ! Notre équipe vous contactera bientôt.');
    },
    onError: (error) => {
      console.error('Erreur envoi:', error);
      const errorMessage = error?.message || 'Une erreur est survenue. Veuillez réessayer.';
      toast.error(errorMessage);
    }
  });

  const handleSubmitAchat = (e) => {
    e.preventDefault();
    if (!formDataAchat.consent) {
      toast.error('Veuillez accepter les conditions pour continuer');
      return;
    }
    // Vérifier reCAPTCHA
    const recaptchaValue = recaptchaRefAchat.current?.getValue();
    if (!recaptchaValue) {
      toast.error('Veuillez compléter la vérification "Je ne suis pas un robot"');
      return;
    }
    mutationAchat.mutate({
      ...formDataAchat,
      subject: 'Demande de contact - Achat de véhicule',
      recaptcha: recaptchaValue
    });
    // Réinitialiser reCAPTCHA après envoi
    recaptchaRefAchat.current?.reset();
  };

  const handleSubmitCarteGrise = (e) => {
    e.preventDefault();
    if (!formDataCarteGrise.consent) {
      toast.error('Veuillez accepter les conditions pour continuer');
      return;
    }
    // Vérifier reCAPTCHA
    const recaptchaValue = recaptchaRefCarteGrise.current?.getValue();
    if (!recaptchaValue) {
      toast.error('Veuillez compléter la vérification "Je ne suis pas un robot"');
      return;
    }
    mutationCarteGrise.mutate({
      ...formDataCarteGrise,
      subject: 'Demande de contact - Carte grise & Immatriculation',
      recaptcha: recaptchaValue
    });
    // Réinitialiser reCAPTCHA après envoi
    recaptchaRefCarteGrise.current?.reset();
  };

  const handleChangeAchat = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDataAchat({
      ...formDataAchat,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleChangeCarteGrise = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDataCarteGrise({
      ...formDataCarteGrise,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <AnimatedSection animation="zoom-in" className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Message envoyé !</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Merci de nous avoir contactés{submittedType === 'achat' ? ' pour votre projet d\'achat' : ' pour votre demande de carte grise'}. 
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedType(null);
                  setFormDataAchat({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    message: '',
                    type: 'achat'
                  });
                  setFormDataCarteGrise({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    message: '',
                    type: 'carte_grise'
                  });
                }}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Envoyer un autre message
              </button>
              <Link
                to={createPageUrl('Home')}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section avec image dynamique et effets de scroll */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Image de fond avec effets de parallaxe et fade-out */}
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80)',
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
              Contactez notre agence
            </h1>
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-10 font-light transition-all duration-1000 ease-out"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
                }}
              >
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre projet automobile
            </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc d'informations clés avec icônes */}
      <AnimatedSection animation="fade-up" className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <MapPin className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Adresse</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  93 Av. de Magudas<br />
                  33700 Mérignac<br />
                  France
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <Clock className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Horaires</h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p><strong>Du lundi au samedi:</strong> 08H00 - 12H00 & 14H00-19H30</p>
                  <p><strong>Le samedi:</strong> Sur rendez-vous</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <Phone className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Téléphone</h3>
                <a 
                  href="tel:+33556973752" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold text-lg"
                >
                  +33 5 56 97 37 52
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-xl mb-4">
                  <Mail className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
                <a 
                  href="mailto:jdcauto33@orange.fr" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold break-all"
                >
                  jdcauto33@orange.fr
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </AnimatedSection>

      {/* Double zone de contact */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Achat de véhicule */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-red-100 hover:border-red-200 transition-all duration-300 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Contact – Achat de véhicule
                </h2>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Notre équipe commerciale se fera un plaisir de répondre à vos attentes pour toute recherche de véhicules neufs ou d'occasions. 
                Avec plus de 7 200 concessions partenaires et 2 millions de véhicules disponibles en Europe, nous vous aidons à trouver le véhicule qui correspond à vos besoins et à votre budget.
              </p>

              <form onSubmit={handleSubmitAchat} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formDataAchat.first_name}
                      onChange={handleChangeAchat}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formDataAchat.last_name}
                      onChange={handleChangeAchat}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formDataAchat.email}
                      onChange={handleChangeAchat}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formDataAchat.phone}
                      onChange={handleChangeAchat}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      placeholder="+33 5 56 97 37 52"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formDataAchat.message}
                    onChange={handleChangeAchat}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre projet d'achat, le type de véhicule recherché..."
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formDataAchat.consent}
                    onChange={handleChangeAchat}
                    className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    J'accepte que mes données soient utilisées par JDC AUTO pour me recontacter dans le cadre d'une relation commerciale. 
                    Je peux exercer mes droits d'accès, de rectification et de suppression en contactant JDC AUTO.
                  </span>
                </label>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRefAchat}
                    sitekey={RECAPTCHA_SITE_KEY}
                    theme="light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mutationAchat.isPending}
                  className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {mutationAchat.isPending ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      Contacter pour un achat
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Carte grise / Immatriculation */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Contact – Carte grise & Immatriculation
                </h2>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                Nous avons un point carte grise qui vous permettra d'établir votre nouvelle carte grise en 15 minutes. 
                Notre service dédié vous accompagne dans l'obtention de votre carte grise et toutes les formalités d'immatriculation.
              </p>

              <form onSubmit={handleSubmitCarteGrise} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formDataCarteGrise.first_name}
                      onChange={handleChangeCarteGrise}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formDataCarteGrise.last_name}
                      onChange={handleChangeCarteGrise}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formDataCarteGrise.email}
                      onChange={handleChangeCarteGrise}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formDataCarteGrise.phone}
                      onChange={handleChangeCarteGrise}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="+33 5 56 97 37 52"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formDataCarteGrise.message}
                    onChange={handleChangeCarteGrise}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre demande (carte grise, changement de propriétaire, etc.)..."
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formDataCarteGrise.consent}
                    onChange={handleChangeCarteGrise}
                    className="w-5 h-5 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    J'accepte que mes données soient utilisées par JDC AUTO pour me recontacter dans le cadre d'une relation commerciale. 
                    Je peux exercer mes droits d'accès, de rectification et de suppression en contactant JDC AUTO.
                  </span>
                </label>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRefCarteGrise}
                    sitekey={RECAPTCHA_SITE_KEY}
                    theme="light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mutationCarteGrise.isPending}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {mutationCarteGrise.isPending ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      Contacter pour une carte grise
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Section coordonnées détaillées */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos coordonnées
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Retrouvez toutes nos informations pour nous contacter ou nous rendre visite
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                  <MapPin className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Adresse</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  93 Av. de Magudas<br />
                  33700 Mérignac<br />
                  France
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Horaires d'ouverture</h3>
                <div className="text-gray-600 text-sm space-y-1">
                  <p><strong>Du lundi au samedi:</strong> 08H00 - 12H00 & 14H00-19H30</p>
                  <p><strong>Le samedi:</strong> Sur rendez-vous</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                  <Phone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Téléphone</h3>
                <a 
                  href="tel:+33556973752" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold text-lg block"
                >
                  +33 5 56 97 37 52
                </a>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Email</h3>
                <a 
                  href="mailto:jdcauto33@orange.fr" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold break-all text-sm block"
                >
                  jdcauto33@orange.fr
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Section Carte Google Maps */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Retrouvez-nous
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Visitez notre agence située à Mérignac, près de Bordeaux
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="aspect-video w-full relative bg-gray-100">
                <iframe
                  src="https://www.google.com/maps?q=JDC+Auto+93+Av.+de+Magudas+33700+Mérignac&hl=fr&z=15&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation JDC Auto - 93 Av. de Magudas, 33700 Mérignac"
                  onError={() => setMapError(true)}
                />
                {/* Overlay avec liens alternatifs si la carte ne charge pas */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=JDC+Auto+Mérignac+93+Av.+de+Magudas+33700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white hover:bg-red-600 text-gray-900 hover:text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
                    title="Ouvrir dans Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Google Maps
                  </a>
                  <a
                    href="https://www.openstreetmap.org/?mlat=44.85&mlon=-0.63&zoom=15#map=15/44.85/-0.63"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white hover:bg-blue-600 text-gray-900 hover:text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm"
                    title="Ouvrir dans OpenStreetMap"
                  >
                    <ExternalLink className="w-4 h-4" />
                    OpenStreetMap
                  </a>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">JDC Auto</p>
                      <p className="font-semibold text-gray-700 mb-1">93 Av. de Magudas</p>
                      <p className="text-gray-600 text-sm">33700 Mérignac, France</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=JDC+Auto+Mérignac+93+Av.+de+Magudas+33700"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                    >
                      Voir sur Google Maps
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Call-to-action secondaire */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <AnimatedSection animation="zoom-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Notre équipe est à votre écoute
            </h2>
            <p className="text-xl mb-10 text-red-100 max-w-2xl mx-auto">
              Découvrez notre sélection de véhicules d'occasion ou contactez-nous pour une estimation gratuite de votre véhicule
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to={createPageUrl('Vehicles')}
                className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                Voir nos véhicules
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to={createPageUrl('TradeIn')}
                className="px-8 py-4 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white font-semibold rounded-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 flex items-center gap-2"
              >
                Estimation gratuite
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
