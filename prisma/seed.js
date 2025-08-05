import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Liste des catégories principales et sous-catégories
  const categories = [
    {
      id: 'vehicules',
      name: 'Véhicules',
      icon: '🚗',
      allowRent: true,
      children: [
        { id: 'voitures', name: 'Voitures', icon: '🚙', allowRent: true },
        { id: 'motos', name: 'Motos', icon: '🏍️', allowRent: false },
        { id: 'caravaning', name: 'Caravaning', icon: '🏕️', allowRent: true },
        { id: 'utilitaires', name: 'Utilitaires', icon: '🚐', allowRent: true },
        { id: 'camions', name: 'Camions', icon: '🚛', allowRent: false },
        { id: 'nautisme', name: 'Nautisme', icon: '🛥️', allowRent: true },
      ],
    },
    {
      id: 'immobilier',
      name: 'Immobilier',
      icon: '🏠',
      allowRent: true,
      children: [
        {
          id: 'ventes',
          name: 'Ventes immobilières',
          icon: '🔑',
          allowRent: false,
        },
        { id: 'locations', name: 'Locations', icon: '📃', allowRent: true },
        { id: 'colocations', name: 'Colocations', icon: '👥', allowRent: true },
        {
          id: 'bureaux',
          name: 'Bureaux & Commerces',
          icon: '🏬',
          allowRent: true,
        },
      ],
    },
    {
      id: 'vacances',
      name: 'Vacances',
      icon: '🏖️',
      allowRent: true,
      children: [
        {
          id: 'locations_saisonnieres',
          name: 'Locations saisonnières',
          icon: '🏡',
          allowRent: true,
        },
      ],
    },
    {
      id: 'emploi',
      name: 'Emploi',
      icon: '💼',
      allowRent: false,
      children: [
        { id: 'offres', name: 'Offres d’emploi', icon: '📢', allowRent: false },
        {
          id: 'demandes',
          name: 'Demandes d’emploi',
          icon: '📩',
          allowRent: false,
        },
      ],
    },
    {
      id: 'mode',
      name: 'Mode',
      icon: '👗',
      allowRent: false,
      children: [
        { id: 'vetements', name: 'Vêtements', icon: '👚', allowRent: false },
        { id: 'chaussures', name: 'Chaussures', icon: '👟', allowRent: false },
        {
          id: 'accessoires',
          name: 'Accessoires & Bagagerie',
          icon: '👜',
          allowRent: false,
        },
        {
          id: 'bijoux',
          name: 'Montres & Bijoux',
          icon: '💍',
          allowRent: false,
        },
      ],
    },
    {
      id: 'maison_jardin',
      name: 'Maison & Jardin',
      icon: '🏡',
      allowRent: false,
      children: [
        {
          id: 'ameublement',
          name: 'Ameublement',
          icon: '🛋️',
          allowRent: false,
        },
        {
          id: 'electromenager',
          name: 'Électroménager',
          icon: '🍳',
          allowRent: false,
        },
        { id: 'decoration', name: 'Décoration', icon: '🖼️', allowRent: false },
        {
          id: 'jardin',
          name: 'Jardin & Plantes',
          icon: '🌱',
          allowRent: false,
        },
        { id: 'bricolage', name: 'Bricolage', icon: '🔨', allowRent: false },
      ],
    },
    {
      id: 'famille',
      name: 'Famille (Puériculture)',
      icon: '🍼',
      allowRent: false,
      children: [
        {
          id: 'equipement_bebe',
          name: 'Équipement bébé',
          icon: '👶',
          allowRent: false,
        },
        {
          id: 'mobilier_enfant',
          name: 'Mobilier enfant',
          icon: '🛏️',
          allowRent: false,
        },
        {
          id: 'vetements_bebe',
          name: 'Vêtements bébé',
          icon: '🧸',
          allowRent: false,
        },
      ],
    },
    {
      id: 'electronique',
      name: 'Électronique',
      icon: '📱',
      allowRent: false,
      children: [
        {
          id: 'smartphones',
          name: 'Smartphones',
          icon: '📱',
          allowRent: false,
        },
        {
          id: 'ordinateurs',
          name: 'Ordinateurs',
          icon: '💻',
          allowRent: false,
        },
        {
          id: 'photo_audio_video',
          name: 'Photo/Audio/Vidéo',
          icon: '📷',
          allowRent: false,
        },
        {
          id: 'tablettes',
          name: 'Tablettes & Liseuses',
          icon: '📚',
          allowRent: false,
        },
        {
          id: 'consoles',
          name: 'Consoles & Jeux vidéo',
          icon: '🎮',
          allowRent: false,
        },
      ],
    },
    {
      id: 'loisirs',
      name: 'Loisirs',
      icon: '🎉',
      allowRent: false,
      children: [
        {
          id: 'antiques',
          name: 'Antiquités & Collections',
          icon: '🏺',
          allowRent: false,
        },
        {
          id: 'instruments',
          name: 'Instruments de musique',
          icon: '🎵',
          allowRent: false,
        },
        { id: 'livres', name: 'Livres', icon: '📚', allowRent: false },
        {
          id: 'sport',
          name: 'Sport & Plein air',
          icon: '🏀',
          allowRent: false,
        },
        { id: 'jeux', name: 'Jeux & Jouets', icon: '🧩', allowRent: false },
      ],
    },
    {
      id: 'animaux',
      name: 'Animaux',
      icon: '🐾',
      allowRent: false,
      children: [
        {
          id: 'animaux_vivants',
          name: 'Animaux vivants',
          icon: '🐶',
          allowRent: false,
        },
        {
          id: 'accessoires_animaux',
          name: 'Accessoires animaux',
          icon: '🐱',
          allowRent: false,
        },
      ],
    },
    {
      id: 'materiel_pro',
      name: 'Matériel professionnel',
      icon: '🏭',
      allowRent: false,
      children: [
        {
          id: 'agricole',
          name: 'Matériel agricole',
          icon: '🚜',
          allowRent: false,
        },
        {
          id: 'medical',
          name: 'Matériel médical',
          icon: '🩺',
          allowRent: false,
        },
        {
          id: 'industriel',
          name: 'Équipements industriels',
          icon: '⚙️',
          allowRent: false,
        },
      ],
    },
    {
      id: 'services',
      name: 'Services',
      icon: '🛎️',
      allowRent: false,
      children: [
        {
          id: 'baby_sitting',
          name: 'Baby-Sitting',
          icon: '👶',
          allowRent: false,
        },
        {
          id: 'cours_particuliers',
          name: 'Cours particuliers',
          icon: '📖',
          allowRent: false,
        },
        {
          id: 'jardinage',
          name: 'Jardinage & Bricolage',
          icon: '🌿',
          allowRent: false,
        },
      ],
    },
    {
      id: 'autres',
      name: 'Autres/Divers',
      icon: '🔄',
      allowRent: false,
      children: [
        { id: 'divers', name: 'Divers', icon: '❓', allowRent: false },
      ],
    },
  ];

  // Upsert des catégories et sous-catégories
  for (const parent of categories) {
    await prisma.category.upsert({
      where: { id: parent.id },
      update: {},
      create: {
        id: parent.id,
        name: parent.name,
        icon: parent.icon,
        allowRent: parent.allowRent,
      },
    });
    for (const child of parent.children) {
      await prisma.category.upsert({
        where: { id: child.id },
        update: {},
        create: {
          id: child.id,
          name: child.name,
          icon: child.icon,
          parentId: parent.id,
          allowRent: child.allowRent,
        },
      });
    }
  }

  const fields = [
    // Véhicules > Voitures
    { categoryId: 'voitures', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'voitures',
      name: 'Kilométrage',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'voitures',
      name: 'Carburant',
      type: 'SELECT',
      options: ['Essence', 'Diesel', 'Hybride', 'Électrique'],
      required: true,
    },
    {
      categoryId: 'voitures',
      name: 'Boîte de vitesse',
      type: 'SELECT',
      options: ['Manuelle', 'Automatique'],
      required: true,
    },
    {
      categoryId: 'voitures',
      name: 'Carrosserie',
      type: 'SELECT',
      options: [
        'Berline',
        'Break',
        'Monospace',
        'SUV/4x4',
        'Coupé',
        'Cabriolet',
        'Citadine',
        'Utilitaire',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Nombre de portes',
      type: 'SELECT',
      options: ['2', '3', '4', '5'],
      required: false,
    },
    { categoryId: 'voitures', name: 'Couleur', type: 'TEXT', required: false },

    // Véhicules > Motos
    { categoryId: 'motos', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'motos', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'motos', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'motos',
      name: 'Kilométrage',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'motos',
      name: 'Cylindrée (cm³)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'motos',
      name: 'Type de permis',
      type: 'SELECT',
      options: ['A1', 'A2', 'A'],
      required: true,
    },
    {
      categoryId: 'motos',
      name: 'Type de moto',
      type: 'SELECT',
      options: [
        'Sportive',
        'Roadster',
        'Custom',
        'Trail/Enduro',
        'Scooter',
        'Cross',
        'Autre',
      ],
      required: false,
    },
    { categoryId: 'motos', name: 'Couleur', type: 'TEXT', required: false },

    // Véhicules > Caravaning
    { categoryId: 'caravaning', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'caravaning', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'caravaning', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'caravaning',
      name: 'Kilométrage',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Longueur (m)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'caravaning',
      name: 'Nombre de couchages',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'caravaning',
      name: 'Énergie',
      type: 'SELECT',
      options: ['Gaz', 'Électrique'],
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Type de véhicule',
      type: 'SELECT',
      options: [
        'Caravane',
        'Camping-car',
        'Van aménagé',
        'Mobil-home',
        'Autre',
      ],
      required: true,
    },

    // Véhicules > Utilitaires
    { categoryId: 'utilitaires', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'utilitaires', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'utilitaires',
      name: 'Année',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'utilitaires',
      name: 'Kilométrage',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'utilitaires',
      name: 'Carburant',
      type: 'SELECT',
      options: ['Diesel', 'Essence'],
      required: true,
    },
    {
      categoryId: 'utilitaires',
      name: 'Boîte de vitesse',
      type: 'SELECT',
      options: ['Manuelle', 'Automatique'],
      required: false,
    },
    {
      categoryId: 'utilitaires',
      name: 'Charge utile (kg)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'utilitaires',
      name: 'PTAC (kg)',
      type: 'NUMBER',
      required: true,
    },

    // Véhicules > Camions
    { categoryId: 'camions', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'camions', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'camions', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'camions',
      name: 'Kilométrage',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'camions',
      name: 'Carburant',
      type: 'SELECT',
      options: ['Diesel', 'Essence', 'Électrique'],
      required: true,
    },
    {
      categoryId: 'camions',
      name: 'Boîte de vitesse',
      type: 'SELECT',
      options: ['Manuelle', 'Automatique'],
      required: false,
    },
    {
      categoryId: 'camions',
      name: 'PTAC (kg)',
      type: 'NUMBER',
      required: true,
    },

    // Véhicules > Nautisme
    {
      categoryId: 'nautisme',
      name: 'Type de bateau',
      type: 'SELECT',
      options: ['Voilier', 'Bateau à moteur', 'Péniche'],
      required: true,
    },
    { categoryId: 'nautisme', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'nautisme', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'nautisme', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'nautisme',
      name: 'Longueur (m)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'nautisme',
      name: 'Nombre de couchages',
      type: 'NUMBER',
      required: false,
    },

    // Immobilier > Ventes immobilières
    {
      categoryId: 'ventes',
      name: 'Surface (m²)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'ventes',
      name: 'Nombre de pièces',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'ventes',
      name: 'Nombre de chambres',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'ventes',
      name: 'Salles de bain',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Type de bien',
      type: 'SELECT',
      options: ['Appartement', 'Maison', 'Studio', 'Autre'],
      required: true,
    },
    {
      categoryId: 'ventes',
      name: 'Année construction',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Nombre d’étages',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Étage',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Ascenseur',
      type: 'BOOLEAN',
      required: false,
    },
    { categoryId: 'ventes', name: 'Parking', type: 'BOOLEAN', required: false },
    { categoryId: 'ventes', name: 'Jardin', type: 'BOOLEAN', required: false },
    {
      categoryId: 'ventes',
      name: 'Terrasse',
      type: 'BOOLEAN',
      required: false,
    },
    { categoryId: 'ventes', name: 'Balcon', type: 'BOOLEAN', required: false },
    {
      categoryId: 'ventes',
      name: 'Surface terrain (m²)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Classe énergie',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'GES',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },

    // Immobilier > Locations
    {
      categoryId: 'locations',
      name: 'Type de bien',
      type: 'SELECT',
      options: ['Appartement', 'Maison', 'Studio', 'Autre'],
      required: true,
    },
    {
      categoryId: 'locations',
      name: 'Surface (m²)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations',
      name: 'Nombre de pièces',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations',
      name: 'Nombre de chambres',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations',
      name: 'Meublé',
      type: 'SELECT',
      options: ['Oui', 'Non'],
      required: false,
    },
    { categoryId: 'locations', name: 'Étage', type: 'NUMBER', required: false },
    {
      categoryId: 'locations',
      name: 'Ascenseur',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Parking',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Jardin',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Terrasse',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Balcon',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Charges comprises',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Charges mensuelles (€)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Classe énergie',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'GES',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },

    // Immobilier > Colocations
    {
      categoryId: 'colocations',
      name: 'Surface de la chambre (m²)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'colocations',
      name: 'Nombre de colocataires',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'colocations',
      name: 'Meublé',
      type: 'SELECT',
      options: ['Oui', 'Non'],
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Fumeur accepté',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Animaux acceptés',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Charges comprises',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Charges mensuelles (€)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Classe énergie',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'GES',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },

    // Immobilier > Bureaux & Commerces
    {
      categoryId: 'bureaux',
      name: 'Surface (m²)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'bureaux',
      name: 'Type',
      type: 'SELECT',
      options: ['Bureau', 'Commerce'],
      required: true,
    },
    {
      categoryId: 'bureaux',
      name: 'Meublé',
      type: 'SELECT',
      options: ['Oui', 'Non'],
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Ascenseur',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Parking',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Charges comprises',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Charges mensuelles (€)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Classe énergie',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'GES',
      type: 'SELECT',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Vierge'],
      required: false,
    },

    // Vacances > Locations saisonnières
    {
      categoryId: 'locations_saisonnieres',
      name: 'Capacité d’accueil (personnes)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Chambres',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Salles de bain',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Surface (m²)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Animaux acceptés',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Piscine',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Wi-Fi',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Climatisation',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Parking',
      type: 'BOOLEAN',
      required: false,
    },

    // Emploi > Offres d’emploi
    {
      categoryId: 'offres',
      name: 'Type de contrat',
      type: 'SELECT',
      options: ['CDD', 'CDI', 'Intérim', 'Freelance'],
      required: true,
    },
    {
      categoryId: 'offres',
      name: 'Niveau d’études requis',
      type: 'SELECT',
      options: ['Aucun', 'CAP/BEP', 'Bac', 'Bac+2', 'Bac+3/4', 'Bac+5 et plus'],
      required: false,
    },
    {
      categoryId: 'offres',
      name: 'Expérience (années)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'offres',
      name: 'Salaire min (€)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'offres',
      name: 'Salaire max (€)',
      type: 'NUMBER',
      required: false,
    },

    // Emploi > Demandes d’emploi
    {
      categoryId: 'demandes',
      name: 'Métier recherché',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'demandes',
      name: 'Expérience (années)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'demandes',
      name: 'Niveau d’études',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'demandes',
      name: 'Type de contrat souhaité',
      type: 'SELECT',
      options: ['CDD', 'CDI', 'Intérim', 'Freelance', 'Alternance'],
      required: false,
    },

    // Mode > Vêtements
    {
      categoryId: 'vetements',
      name: 'Genre',
      type: 'SELECT',
      options: ['Homme', 'Femme', 'Unisexe'],
      required: true,
    },
    { categoryId: 'vetements', name: 'Taille', type: 'TEXT', required: true },
    { categoryId: 'vetements', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'vetements', name: 'Couleur', type: 'TEXT', required: false },
    { categoryId: 'vetements', name: 'Matière', type: 'TEXT', required: false },
    {
      categoryId: 'vetements',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Mode > Chaussures
    {
      categoryId: 'chaussures',
      name: 'Pointure',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'chaussures',
      name: 'Genre',
      type: 'SELECT',
      options: ['Homme', 'Femme', 'Unisexe'],
      required: true,
    },
    { categoryId: 'chaussures', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'chaussures',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Mode > Accessoires & Bagagerie
    { categoryId: 'accessoires', name: 'Type', type: 'TEXT', required: true },
    {
      categoryId: 'accessoires',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'accessoires',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Mode > Montres & Bijoux
    { categoryId: 'bijoux', name: 'Type', type: 'TEXT', required: true },
    { categoryId: 'bijoux', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'bijoux', name: 'Matériau', type: 'TEXT', required: false },
    {
      categoryId: 'bijoux',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Maison & Jardin > Ameublement
    { categoryId: 'ameublement', name: 'Type', type: 'TEXT', required: true },
    {
      categoryId: 'ameublement',
      name: 'Matériau',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'ameublement',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Maison & Jardin > Électroménager
    {
      categoryId: 'electromenager',
      name: 'Type d’appareil',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'electromenager',
      name: 'Marque',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'electromenager',
      name: 'Énergie',
      type: 'SELECT',
      options: ['Électrique', 'Gaz', 'Autre'],
      required: false,
    },
    {
      categoryId: 'electromenager',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Maison & Jardin > Décoration
    { categoryId: 'decoration', name: 'Type', type: 'TEXT', required: true },
    { categoryId: 'decoration', name: 'Style', type: 'TEXT', required: false },
    {
      categoryId: 'decoration',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Bon état', 'Usé'],
      required: false,
    },

    // Maison & Jardin > Jardin & Plantes
    {
      categoryId: 'jardin',
      name: 'Type de plante',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'jardin',
      name: 'Intérieur/Extérieur',
      type: 'SELECT',
      options: ['Intérieur', 'Extérieur'],
      required: true,
    },
    {
      categoryId: 'jardin',
      name: 'Hauteur (cm)',
      type: 'NUMBER',
      required: false,
    },
    { categoryId: 'jardin', name: 'Âge', type: 'TEXT', required: false },

    // Maison & Jardin > Bricolage
    {
      categoryId: 'bricolage',
      name: 'Type d’outils',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'bricolage', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'bricolage',
      name: 'Alimentation',
      type: 'SELECT',
      options: [
        'Manuel',
        'Électrique (filaire)',
        'Sans fil (batterie)',
        'Essence',
      ],
      required: false,
    },
    {
      categoryId: 'bricolage',
      name: 'Puissance (W)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'bricolage',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Famille (Puériculture) > Équipement bébé
    {
      categoryId: 'equipement_bebe',
      name: 'Type',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'equipement_bebe',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'equipement_bebe',
      name: 'Âge enfant',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'equipement_bebe',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Famille > Mobilier enfant
    {
      categoryId: 'mobilier_enfant',
      name: 'Type',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'mobilier_enfant',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'mobilier_enfant',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Famille > Vêtements bébé
    {
      categoryId: 'vetements_bebe',
      name: 'Taille',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'vetements_bebe',
      name: 'Genre',
      type: 'SELECT',
      options: ['Garçon', 'Fille'],
      required: false,
    },
    {
      categoryId: 'vetements_bebe',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'vetements_bebe',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Électronique > Smartphones
    { categoryId: 'smartphones', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'smartphones', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'smartphones',
      name: 'Couleur',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'smartphones',
      name: 'Stockage',
      type: 'SELECT',
      options: ['64 Go', '128 Go', '256 Go', '512 Go'],
      required: true,
    },
    {
      categoryId: 'smartphones',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },
    {
      categoryId: 'smartphones',
      name: 'Débloqué',
      type: 'BOOLEAN',
      required: false,
    },

    // Électronique > Ordinateurs
    { categoryId: 'ordinateurs', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'ordinateurs', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'ordinateurs', name: 'RAM', type: 'TEXT', required: true },
    {
      categoryId: 'ordinateurs',
      name: 'Type de disque',
      type: 'SELECT',
      options: ['SSD', 'HDD'],
      required: true,
    },
    {
      categoryId: 'ordinateurs',
      name: 'Capacité de stockage (Go)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'ordinateurs',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },

    // Électronique > Photo/Audio/Vidéo
    {
      categoryId: 'photo_audio_video',
      name: 'Type de produit',
      type: 'SELECT',
      options: ['Appareil photo', 'Caméra', 'Enceinte'],
      required: true,
    },
    {
      categoryId: 'photo_audio_video',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'photo_audio_video',
      name: 'Modèle',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'photo_audio_video',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Électronique > Tablettes & Liseuses
    { categoryId: 'tablettes', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'tablettes', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'tablettes',
      name: 'Stockage',
      type: 'SELECT',
      options: ['32 Go', '64 Go', '128 Go'],
      required: true,
    },
    {
      categoryId: 'tablettes',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },

    // Électronique > Consoles & Jeux vidéo
    {
      categoryId: 'consoles',
      name: 'Type d’article',
      type: 'SELECT',
      options: ['Console', 'Jeu', 'Accessoire'],
      required: true,
    },
    {
      categoryId: 'consoles',
      name: 'Plateforme',
      type: 'SELECT',
      options: ['PC', 'PS5', 'Xbox', 'Switch'],
      required: true,
    },
    { categoryId: 'consoles', name: 'Édition', type: 'TEXT', required: false },
    {
      categoryId: 'consoles',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Loisirs > Antiquités & Collections
    {
      categoryId: 'antiques',
      name: 'Type de collection',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'antiques',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Loisirs > Instruments de musique
    {
      categoryId: 'instruments',
      name: 'Instrument',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'instruments',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'instruments',
      name: 'Modèle',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'instruments',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Loisirs > Livres
    { categoryId: 'livres', name: 'Genre', type: 'TEXT', required: false },
    { categoryId: 'livres', name: 'Auteur', type: 'TEXT', required: false },
    {
      categoryId: 'livres',
      name: 'Langue',
      type: 'SELECT',
      options: [
        'Français',
        'Anglais',
        'Espagnol',
        'Allemand',
        'Italien',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'livres',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Loisirs > Sport & Plein air
    {
      categoryId: 'sport',
      name: 'Type de sport',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'sport', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'sport',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Loisirs > Jeux & Jouets
    {
      categoryId: 'jeux',
      name: 'Type',
      type: 'TEXT',
      required: false,
    },
    { categoryId: 'jeux', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'jeux',
      name: 'Âge recommandé',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'jeux',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Animaux > Animaux vivants
    {
      categoryId: 'animaux_vivants',
      name: 'Espèce',
      type: 'SELECT',
      options: ['Chien', 'Chat', 'Oiseau', 'Autre'],
      required: true,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Race',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Âge',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Sexe',
      type: 'SELECT',
      options: ['Mâle', 'Femelle'],
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Vacciné',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Pucé',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Inscrit LOF/LOOF',
      type: 'BOOLEAN',
      required: false,
    },

    // Animaux > Accessoires animaux
    {
      categoryId: 'accessoires_animaux',
      name: 'Type d’accessoire',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'accessoires_animaux',
      name: 'Marque',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'accessoires_animaux',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Matériel pro > Matériel agricole
    {
      categoryId: 'agricole',
      name: 'Type de machine',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'agricole', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'agricole', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'agricole', name: 'Année', type: 'NUMBER', required: false },
    {
      categoryId: 'agricole',
      name: 'Heures d’utilisation',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'agricole',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Matériel pro > Matériel médical
    {
      categoryId: 'medical',
      name: 'Spécialité',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'medical', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'medical', name: 'Année', type: 'NUMBER', required: false },
    {
      categoryId: 'medical',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Matériel pro > Équipements industriels
    {
      categoryId: 'industriel',
      name: 'Type d’équipement',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'industriel', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'industriel',
      name: 'Année',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'industriel',
      name: 'Heures d’utilisation',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'industriel',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // Services > Baby-Sitting
    {
      categoryId: 'baby_sitting',
      name: 'Âge enfants',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'baby_sitting',
      name: 'Expérience (années)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'baby_sitting',
      name: 'Diplômes',
      type: 'TEXT',
      required: false,
    },

    // Services > Cours particuliers
    {
      categoryId: 'cours_particuliers',
      name: 'Matière',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'cours_particuliers',
      name: 'Niveau enseigné',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'cours_particuliers',
      name: 'Expérience (années)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'cours_particuliers',
      name: 'Diplôme',
      type: 'TEXT',
      required: false,
    },

    // Services > Jardinage & Bricolage
    {
      categoryId: 'jardinage',
      name: 'Type de service',
      type: 'TEXT',
      required: true,
    },
    {
      categoryId: 'jardinage',
      name: 'Expérience (années)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'jardinage',
      name: 'Matériel fourni',
      type: 'BOOLEAN',
      required: false,
    },

    // Autres > Divers
    // (Pas de champs spécifiques additionnels, utiliser le titre/description globaux)
  ];

  // Insertion des champs dynamiques
  for (const field of fields) {
    const exists = await prisma.categoryField.findFirst({
      where: { categoryId: field.categoryId, name: field.name },
    });
    if (!exists) {
      await prisma.categoryField.create({ data: field });
    }
  }
}

main()
  .then(() => console.log('✅ Seed complet Leboncoin terminé'))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
