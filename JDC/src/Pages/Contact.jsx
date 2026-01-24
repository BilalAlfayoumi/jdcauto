import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
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
import { useHeroScroll } from '../hooks/useHeroScroll';
import { createPageUrl } from '../utils';

export default function Contact() {
  const [formDataAchat, setFormDataAchat] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    type: 'achat'
  });

  const [formDataCarteGrise, setFormDataCarteGrise] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    type: 'carte_grise'
  });

  const [submitted, setSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState(null);

  const heroScroll = useHeroScroll();

  const mutationAchat = useMutation({
    mutationFn: (data) => base44.entities.ContactRequest.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setSubmittedType('achat');
      toast.success('Message envoyé avec succès ! Notre équipe vous contactera bientôt.');
    },
    onError: () => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  const mutationCarteGrise = useMutation({
    mutationFn: (data) => base44.entities.ContactRequest.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setSubmittedType('carte_grise');
      toast.success('Message envoyé avec succès ! Notre équipe vous contactera bientôt.');
    },
    onError: () => {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  const handleSubmitAchat = (e) => {
    e.preventDefault();
    mutationAchat.mutate({
      ...formDataAchat,
      subject: 'Demande de contact - Achat de véhicule'
    });
  };

  const handleSubmitCarteGrise = (e) => {
    e.preventDefault();
    mutationCarteGrise.mutate({
      ...formDataCarteGrise,
      subject: 'Demande de contact - Carte grise & Immatriculation'
    });
  };

  const handleChangeAchat = (e) => {
    setFormDataAchat({
      ...formDataAchat,
      [e.target.name]: e.target.value
    });
  };

  const handleChangeCarteGrise = (e) => {
    setFormDataCarteGrise({
      ...formDataCarteGrise,
      [e.target.name]: e.target.value
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
      {/* Hero Section avec image immersive et animation au scroll */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Image de fond avec animation */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80)',
            opacity: heroScroll.imageOpacity,
            transform: `scale(${heroScroll.imageScale})`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        {/* Contenu du hero */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div 
            className="text-center px-4 max-w-4xl mx-auto"
            style={{
              opacity: heroScroll.contentOpacity,
              transform: `translateY(${heroScroll.contentTranslateY}px)`,
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
            }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Contactez notre agence
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre projet automobile
            </p>
          </div>
        </div>
      </section>

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
                  <p><strong>Lun - Ven:</strong> 9h00 - 19h00</p>
                  <p><strong>Samedi:</strong> 9h00 - 18h00</p>
                  <p><strong>Dimanche:</strong> Fermé</p>
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
                  href="tel:0556973752" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold text-lg"
                >
                  05 56 97 37 52
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
                  href="mailto:contact@jdcauto.fr" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold break-all"
                >
                  contact@jdcauto.fr
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
                Notre équipe de conseillers est à votre disposition pour vous accompagner dans votre projet d'achat. 
                Nous vous aidons à trouver le véhicule qui correspond à vos besoins et à votre budget.
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
                      placeholder="05 56 97 37 52"
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
                Besoin d'aide pour vos démarches administratives ? Notre service dédié vous accompagne 
                dans l'obtention de votre carte grise et toutes les formalités d'immatriculation.
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
                      placeholder="05 56 97 37 52"
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
                  <p><strong>Lun - Ven:</strong> 9h00 - 19h00</p>
                  <p><strong>Samedi:</strong> 9h00 - 18h00</p>
                  <p><strong>Dimanche:</strong> Fermé</p>
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
                  href="tel:0556973752" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold text-lg block"
                >
                  05 56 97 37 52
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
                  href="mailto:contact@jdcauto.fr" 
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold break-all text-sm block"
                >
                  contact@jdcauto.fr
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
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps?q=JDC+Auto+93+Av.+de+Magudas+33700+Mérignac&hl=fr&z=15&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation JDC Auto - 93 Av. de Magudas, 33700 Mérignac"
                />
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
