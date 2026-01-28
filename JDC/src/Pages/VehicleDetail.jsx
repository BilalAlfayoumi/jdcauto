import React, { useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ImageWithAnimation from '../Components/ImageWithAnimation';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Palette,
  Users,
  DoorOpen,
  ChevronLeft,
  Phone,
  Mail,
  X,
  ChevronRight,
  Car,
  Zap,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';

export default function VehicleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = React.useState(0);
  const [isKeyInfoOpen, setIsKeyInfoOpen] = React.useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = React.useState(false);
  const [contactFormData, setContactFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });
  const recaptchaRefVehicle = useRef(null);
  
  // Clé reCAPTCHA (à remplacer par votre clé de site)
  const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Clé de test Google (à remplacer)

  // Configuration EmailJS
  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_uxxnivr',
    TEMPLATE_ID: 'template_sq3rlfb',
    PUBLIC_KEY: 'AQaaMiMFeiYBqPjIr'
  };

  // Initialiser EmailJS
  React.useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // Mutation pour envoyer le formulaire
  const contactMutation = useMutation({
    mutationFn: async (data) => {
      const vehicleInfo = `
Véhicule concerné :
- Référence : ${vehicle.reference || vehicle.id}
- Marque : ${vehicle.brand}
- Modèle : ${vehicle.model}
- Prix : ${vehicle.price.toLocaleString('fr-FR')} €
- Année : ${vehicle.year}
- Kilométrage : ${vehicle.mileage.toLocaleString('fr-FR')} km
- Carburant : ${vehicle.fuel_type}
- Boîte : ${vehicle.gearbox}
${vehicle.version ? `- Version : ${vehicle.version}` : ''}
${vehicle.color ? `- Couleur : ${vehicle.color}` : ''}
${vehicle.quantity > 1 ? `- Quantité disponible : ${vehicle.quantity}` : ''}

${data.message ? `\nMessage du client :\n${data.message}` : ''}
      `.trim();

      const templateParams = {
        from_name: `${data.first_name} ${data.last_name}`,
        from_email: data.email,
        phone: data.phone,
        message: vehicleInfo,
        subject: `Demande de contact - ${vehicle.brand} ${vehicle.model}`,
        type: 'Demande de contact véhicule',
        to_email: 'jdcauto33@orange.fr', // Email de destination JDC Auto
        vehicle_reference: vehicle.reference || vehicle.id?.toString() || 'N/A',
        vehicle_brand: vehicle.brand || 'N/A',
        vehicle_model: vehicle.model || 'N/A',
        vehicle_price: `${vehicle.price.toLocaleString('fr-FR')} €`,
        vehicle_year: vehicle.year?.toString() || 'N/A',
        vehicle_mileage: `${vehicle.mileage.toLocaleString('fr-FR')} km`,
        vehicle_fuel: vehicle.fuel_type || 'N/A',
        vehicle_image: vehicle.image_url || vehicle.photos?.[0] || 'https://via.placeholder.com/150x100?text=Photo+non+disponible'
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      return { success: true, response };
    },
    onSuccess: () => {
      toast.success('Message envoyé avec succès ! Nous vous contacterons bientôt.');
      setIsContactFormOpen(false);
      setContactFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        message: ''
      });
    },
    onError: (error) => {
      console.error('Erreur envoi:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  });

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      // Utiliser l'action vehicle?id= directement
      const response = await fetch(`/api/index.php?action=vehicle&id=${vehicleId}`);
      if (!response.ok) throw new Error('Véhicule non trouvé');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      
      // Transformation pour compatibilité
      const v = data.data;
      return {
        ...v,
        id: v.id?.toString() || v.reference,
        brand: v.brand || v.marque,
        model: v.model || v.modele,
        price: v.price || parseFloat(v.prix_vente || 0),
        mileage: v.mileage || parseInt(v.kilometrage || 0),
        year: v.year || parseInt(v.annee || new Date().getFullYear()),
        fuel_type: v.fuel_type || v.energie,
        gearbox: v.gearbox || (v.typeboite === 'A' ? 'Automatique' : 'Manuelle'),
        status: v.status || v.etat,
        category: v.category || v.carrosserie,
        image_url: v.image_url || v.photos?.[0] || '',
        photos: v.photos || [],
        // Champs supplémentaires
        color: v.color || v.couleurexterieur || null,
        doors: v.doors || v.nbrporte || null,
        seats: v.seats || v.nbrplace || null,
        power: v.power || v.puissancedyn || null,
        fiscal_power: v.fiscal_power || v.puissance_fiscale || null,
        first_registration: v.first_registration || v.date_mec || null,
        version: v.version || null,
        finition: v.finition || null,
        reference: v.reference || null
      };
    },
    enabled: !!vehicleId,
  });

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        return;
      }

      const photos = vehicle?.photos;
      if (!photos || photos.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        setLightboxPhotoIndex(prev => prev > 0 ? prev - 1 : photos.length - 1);
      } else if (e.key === 'ArrowRight') {
        setLightboxPhotoIndex(prev => prev < photos.length - 1 ? prev + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, vehicle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h1>
          <Link to={createPageUrl('Vehicles')} className="text-red-600 hover:text-red-700">
            Retour aux véhicules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to={createPageUrl('Vehicles')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour aux véhicules
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Main Image */}
              <div className="relative cursor-pointer group" onClick={() => {
                setLightboxPhotoIndex(selectedPhotoIndex);
                setIsLightboxOpen(true);
              }}>
                <ImageWithAnimation
                  src={vehicle.photos && vehicle.photos.length > 0 
                    ? vehicle.photos[selectedPhotoIndex] 
                    : vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop'}
                  alt={`${vehicle.brand} ${vehicle.model} - Photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-96 object-cover group-hover:opacity-90 transition-opacity"
                  animation="zoom-in"
                />
                {/* Overlay hint on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                    Cliquez pour agrandir
                  </div>
                </div>
                {/* Navigation arrows if multiple photos */}
                {vehicle.photos && vehicle.photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex(prev => prev > 0 ? prev - 1 : vehicle.photos.length - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex(prev => prev < vehicle.photos.length - 1 ? prev + 1 : 0);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    {/* Photo counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                      {selectedPhotoIndex + 1} / {vehicle.photos.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {vehicle.photos && vehicle.photos.length > 1 && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {vehicle.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedPhotoIndex(index);
                          setLightboxPhotoIndex(index);
                          setIsLightboxOpen(true);
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPhotoIndex === index
                            ? 'border-red-600 ring-2 ring-red-300'
                            : 'border-gray-300 hover:border-red-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${vehicle.brand} ${vehicle.model} - Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&auto=format&fit=crop';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.quantity > 1 && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                    {vehicle.quantity} exemplaires disponibles
                  </span>
                )}
              </div>

              {/* Informations principales - Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Année modèle</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.year}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Gauge className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Kilométrage</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Fuel className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Énergie</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.fuel_type}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Settings className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Boîte de vitesse</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.gearbox}</span>
                </div>
              </div>

              {/* Informations clés complètes */}
              <div className="mb-8 pb-8 border-b">
                <button
                  onClick={() => setIsKeyInfoOpen(!isKeyInfoOpen)}
                  className="w-full flex items-center justify-between text-2xl font-bold text-gray-900 mb-6 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <span>Les informations clés</span>
                  {isKeyInfoOpen ? (
                    <ChevronUp className="w-6 h-6 transition-transform" />
                  ) : (
                    <ChevronDown className="w-6 h-6 transition-transform" />
                  )}
                </button>
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 overflow-hidden ${
                  isKeyInfoOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {/* Première mise en circulation */}
                  {vehicle.first_registration && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Date de première mise en circulation</span>
                        <p className="font-semibold text-gray-900">
                          {vehicle.first_registration.includes('-') 
                            ? new Date(vehicle.first_registration).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })
                            : vehicle.first_registration}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Couleur */}
                  {vehicle.color && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Palette className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Couleur</span>
                        <p className="font-semibold text-gray-900">{vehicle.color}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Nombre de portes */}
                  {vehicle.doors && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <DoorOpen className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Nombre de portes</span>
                        <p className="font-semibold text-gray-900">{vehicle.doors}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Nombre de places */}
                  {vehicle.seats && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Nombre de place(s)</span>
                        <p className="font-semibold text-gray-900">{vehicle.seats}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Puissance fiscale */}
                  {vehicle.fiscal_power && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Zap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Puissance fiscale</span>
                        <p className="font-semibold text-gray-900">{vehicle.fiscal_power} Cv</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Puissance DIN */}
                  {vehicle.power && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Zap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Puissance DIN</span>
                        <p className="font-semibold text-gray-900">{vehicle.power} Ch</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Finition */}
                  {vehicle.finition && vehicle.finition !== 'N/A' && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Finition</span>
                        <p className="font-semibold text-gray-900">{vehicle.finition}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Carrosserie */}
                  {vehicle.category && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">Carrosserie</span>
                        <p className="font-semibold text-gray-900">{vehicle.category}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <div className="text-gray-700 leading-relaxed">
                    {vehicle.description.split('\n').map((line, idx) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return <br key={idx} />;
                      
                      // Détecter les titres principaux (PRIX HT, PRIX TTC, OPTIONS ET ÉQUIPEMENTS)
                      if (trimmedLine.match(/^(PRIX|OPTIONS|ÉQUIPEMENTS|EQUIPEMENTS)/i)) {
                        return <h3 key={idx} className="font-bold text-lg mt-6 mb-3 text-gray-900">{trimmedLine}</h3>;
                      }
                      
                      // Détecter les sections d'équipements
                      if (trimmedLine.includes('OPTIONS ET ÉQUIPEMENTS') || trimmedLine.includes('ÉQUIPEMENTS') || trimmedLine.includes('EQUIPEMENTS')) {
                        return <h3 key={idx} className="font-bold text-lg mt-6 mb-3 text-gray-900">{trimmedLine}</h3>;
                      }
                      
                      // Détecter les prix (PRIX HT, PRIX TTC)
                      if (trimmedLine.match(/^PRIX\s+(HT|TTC)/i)) {
                        return <p key={idx} className="font-semibold text-lg mt-4 mb-2 text-gray-900">{trimmedLine}</p>;
                      }
                      
                      // Détecter les catégories d'équipements (Audio - Télécommunications, Conduite :, etc.)
                      if (trimmedLine.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*[-:]/) || trimmedLine.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*:$/)) {
                        return <h4 key={idx} className="font-semibold mt-4 mb-2 text-gray-800 border-b border-gray-200 pb-1">{trimmedLine}</h4>;
                      }
                      
                      // Détecter les équipements (commencent par -)
                      if (trimmedLine.startsWith('-')) {
                        return <p key={idx} className="ml-4 mb-1">{trimmedLine}</p>;
                      }
                      
                      // Détecter les listes numérotées ou avec puces
                      if (trimmedLine.match(/^[\d•·]\s/)) {
                        return <p key={idx} className="ml-4 mb-1">{trimmedLine}</p>;
                      }
                      
                      // Texte normal (paragraphe)
                      return <p key={idx} className="mb-2">{trimmedLine}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {vehicle.price.toLocaleString('fr-FR')} €
                </div>
                {vehicle.status === 'Disponible' && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Disponible
                  </span>
                )}
                {vehicle.status === 'Réservé' && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    Réservé
                  </span>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900">Intéressé par ce véhicule ?</h3>
                <a
                  href="tel:+33556973752"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  +33 5 56 97 37 52
                  Appeler maintenant
                </a>
                <button
                  onClick={() => setIsContactFormOpen(true)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-md transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Envoyer un message
                </button>
              </div>

              {/* Guarantees */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-gray-900">Nos garanties</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Garantie minimum 6 mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Véhicule contrôlé et certifié</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Reprise de votre ancien véhicule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Démarches administratives incluses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Solutions de financement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {isContactFormOpen && vehicle && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsContactFormOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold mb-1">Contactez-nous</h2>
                <p className="text-red-100 text-sm">Demande concernant ce véhicule</p>
              </div>
              <button
                onClick={() => setIsContactFormOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Vehicle Info Preview */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="flex gap-4">
                {vehicle.image_url && (
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Prix :</strong> {vehicle.price.toLocaleString('fr-FR')} €</div>
                    <div><strong>Année :</strong> {vehicle.year}</div>
                    <div><strong>Km :</strong> {vehicle.mileage.toLocaleString('fr-FR')} km</div>
                    <div><strong>Carburant :</strong> {vehicle.fuel_type}</div>
                  </div>
                  {vehicle.reference && (
                    <div className="mt-2 text-xs text-gray-500">
                      Réf: {vehicle.reference}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactFormData.consent) {
                  toast.error('Veuillez accepter les conditions pour continuer');
                  return;
                }
                // Vérifier reCAPTCHA
                const recaptchaValue = recaptchaRefVehicle.current?.getValue();
                if (!recaptchaValue) {
                  toast.error('Veuillez compléter la vérification "Je ne suis pas un robot"');
                  return;
                }
                contactMutation.mutate({ ...contactFormData, recaptcha: recaptchaValue });
                // Réinitialiser reCAPTCHA après envoi
                recaptchaRefVehicle.current?.reset();
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactFormData.first_name}
                    onChange={(e) => setContactFormData({ ...contactFormData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactFormData.last_name}
                    onChange={(e) => setContactFormData({ ...contactFormData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="+33 5 56 97 37 52"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={contactFormData.message}
                  onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  placeholder="Votre message, questions, demande de rendez-vous..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Les informations du véhicule seront automatiquement incluses dans votre message.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={contactFormData.consent}
                  onChange={(e) => setContactFormData({ ...contactFormData, consent: e.target.checked })}
                  className="w-5 h-5 mt-1 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  J'accepte que mes données soient utilisées par JDC AUTO pour me recontacter dans le cadre d'une relation commerciale. 
                  Je peux exercer mes droits d'accès, de rectification et de suppression en contactant JDC AUTO.
                </span>
              </label>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRefVehicle}
                  sitekey={RECAPTCHA_SITE_KEY}
                  theme="light"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsContactFormOpen(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {contactMutation.isPending ? (
                    'Envoi en cours...'
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && vehicle && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 hover:bg-black/70 p-3 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-7xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                vehicle.photos && vehicle.photos.length > 0
                  ? vehicle.photos[lightboxPhotoIndex]
                  : vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop'
              }
              alt={`${vehicle.brand} ${vehicle.model} - Photo ${lightboxPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Arrows */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev > 0 ? prev - 1 : vehicle.photos.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev < vehicle.photos.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Photo Counter */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-full text-base font-semibold backdrop-blur-sm">
                  {lightboxPhotoIndex + 1} / {vehicle.photos.length}
                </div>
              </>
            )}

            {/* Keyboard Navigation Hint */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="absolute bottom-8 right-8 text-white/70 text-sm">
                Utilisez les flèches pour naviguer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}