export const defaultCarteGriseContent = {
  pricingItems: [
    {
      id: 'titulaire_standard',
      title: 'Changement de titulaire',
      subtitle: 'Cas standard',
      price: '36€24',
      note: 'TTC',
      popular: true,
    },
    {
      id: 'titulaire_particulier',
      title: 'Changement de titulaire',
      subtitle: 'Cas particulier (véhicule étranger, héritage, fiche immobilisation, erreur enregistrement cession...)',
      price: '46€24',
      note: 'TTC',
      popular: false,
    },
    {
      id: 'duplicata',
      title: 'Duplicata',
      subtitle: 'Suite à une perte/vol/détérioré',
      price: '46€24',
      note: 'TTC (+ 20€ si besoin de la FIV pour le CT)',
      popular: false,
    },
    {
      id: 'domicile',
      title: 'Changement de domicile',
      subtitle: '',
      price: '22€',
      note: 'TTC',
      popular: false,
    },
    {
      id: 'cession',
      title: 'Enregistrement de la cession',
      subtitle: '',
      price: '22€',
      note: 'TTC',
      popular: false,
    },
  ],
  documentSections: [
    {
      id: 'general',
      title: 'Pour toutes demandes',
      items: [
        "Permis de conduire et pièce d'identité en cours de validité",
        "Justificatif de domicile de moins de 6 mois (facture téléphone, EDF, GAZ, eau, dernier avis d'imposition, quittance de loyer non manuscrite, attestation d'assurance logement)",
        "Certificat d'immatriculation",
        "Assurance du véhicule",
      ],
      infoText: '',
      cerfaTitle: 'Formulaires CERFA à télécharger :',
      cerfaCards: [
        {
          id: 'cerfa_13750',
          title: 'CERFA 13750',
          badge: "Certificat d'immatriculation",
          fileUrl: '/cerfa-13750.png',
          downloadFilename: 'CERFA-13750-certificat-immatriculation.png',
          fileMeta: {
            mimeType: 'image/png',
            size: 0,
            extension: 'png',
            isImage: true,
          },
        },
        {
          id: 'cerfa_13757',
          title: 'CERFA 13757',
          badge: 'Mandat à un professionnel',
          fileUrl: '/cerfa-13757.png',
          downloadFilename: 'CERFA-13757-mandat-professionnel.png',
          fileMeta: {
            mimeType: 'image/png',
            size: 0,
            extension: 'png',
            isImage: true,
          },
        },
      ],
    },
    {
      id: 'titulaire',
      title: 'Changement de titulaire',
      items: [
        'Ancienne Carte Grise',
        'Certificat de cession original (et D. A. si achat professionnel)',
        'Contrôle technique de moins de 6 mois (si véhicule de + de 4 ans)',
      ],
      infoText: "Cas particulier : pour les 1ère immatriculations en France : Quitus Fiscal + certificat de conformité.",
      cerfaTitle: '',
      cerfaCards: [],
    },
    {
      id: 'domicile',
      title: 'Changement de domicile',
      items: [
        'Carte Grise',
        'Contrôle technique en cours de validité',
      ],
      infoText: '',
      cerfaTitle: '',
      cerfaCards: [],
    },
    {
      id: 'duplicata',
      title: 'Duplicata carte grise',
      items: [
        'Déclaration de perte ou de vol (Cerfa 13753)',
        'Procès verbal pour les vols',
        'Contrôle technique en cours de validité',
      ],
      infoText: '',
      cerfaTitle: 'Formulaire CERFA à télécharger :',
      cerfaCards: [
        {
          id: 'cerfa_13753',
          title: 'CERFA 13753',
          badge: 'Déclaration de perte ou de vol',
          fileUrl: '/cerfa-13753.jpg',
          downloadFilename: 'CERFA-13753-declaration-perte-vol.jpg',
          fileMeta: {
            mimeType: 'image/jpeg',
            size: 0,
            extension: 'jpg',
            isImage: true,
          },
        },
      ],
    },
  ],
};

export function cloneCarteGriseContent(content = defaultCarteGriseContent) {
  return {
    pricingItems: (content.pricingItems || []).map((item) => ({ ...item })),
    documentSections: (content.documentSections || []).map((section) => ({
      ...section,
      items: [...(section.items || [])],
      cerfaCards: (section.cerfaCards || []).map((card) => ({
        ...card,
        fileMeta: {
          mimeType: card.fileMeta?.mimeType || '',
          size: Number(card.fileMeta?.size || 0),
          extension: card.fileMeta?.extension || '',
          isImage: Boolean(card.fileMeta?.isImage),
        },
      })),
    })),
  };
}
