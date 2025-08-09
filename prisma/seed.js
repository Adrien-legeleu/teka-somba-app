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
    // ————————————————————————————
    // VÉHICULES > VOITURES
    // ————————————————————————————
    { categoryId: 'voitures', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'voitures',
      name: 'Kilométrage (km)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'voitures',
      name: 'Carburant',
      type: 'SELECT',
      options: [
        'Essence',
        'Diesel',
        'Hybride',
        'Hybride rechargeable',
        'Électrique',
        'GPL/E85',
      ],
      required: true,
    },
    {
      categoryId: 'voitures',
      name: 'Boîte de vitesse',
      type: 'SELECT',
      options: ['Manuelle', 'Automatique', 'Robotisée'],
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
    {
      categoryId: 'voitures',
      name: 'Couleur',
      type: 'SELECT',
      options: [
        'Noir',
        'Blanc',
        'Gris',
        'Argent',
        'Bleu',
        'Rouge',
        'Vert',
        'Beige',
        'Marron',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Puissance (ch)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Puissance fiscale (CV)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Crit’Air',
      type: 'SELECT',
      options: ['Non soumis', '0', '1', '2', '3', '4', '5'],
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Norme Euro',
      type: 'SELECT',
      options: ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Euro 2', 'Euro 1'],
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Consommation mixte (L/100 km)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Nombre de places',
      type: 'SELECT',
      options: ['2', '4', '5', '7', '8+'],
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Première main',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Entretien à jour',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Contrôle technique OK',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Véhicule non fumeur',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Nombre de propriétaires',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'voitures',
      name: 'Version / Finition',
      type: 'TEXT',
      required: false,
    },

    // ————————————————————————————
    // VÉHICULES > MOTOS
    // ————————————————————————————
    { categoryId: 'motos', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'motos', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'motos', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'motos',
      name: 'Kilométrage (km)',
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
        'Touring',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'motos',
      name: 'Type moteur',
      type: 'SELECT',
      options: ['2 temps', '4 temps'],
      required: false,
    },
    {
      categoryId: 'motos',
      name: 'Refroidissement',
      type: 'SELECT',
      options: ['Air', 'Liquide'],
      required: false,
    },
    {
      categoryId: 'motos',
      name: 'Puissance (ch)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'motos',
      name: 'A2 bridable',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'motos',
      name: 'Couleur',
      type: 'SELECT',
      options: [
        'Noir',
        'Blanc',
        'Gris',
        'Rouge',
        'Bleu',
        'Vert',
        'Orange',
        'Autre',
      ],
      required: false,
    },

    // ————————————————————————————
    // VÉHICULES > CARAVANING
    // ————————————————————————————
    { categoryId: 'caravaning', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'caravaning', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'caravaning', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'caravaning',
      name: 'Kilométrage (km)',
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
      name: 'Largeur (m)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Hauteur (m)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Nombre de couchages',
      type: 'NUMBER',
      required: true,
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
    {
      categoryId: 'caravaning',
      name: 'PTAC (kg)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Places carte grise',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Douche',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Toilettes',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'caravaning',
      name: 'Énergie',
      type: 'SELECT',
      options: ['Gaz', 'Électrique', 'Mixte'],
      required: false,
    },

    // ————————————————————————————
    // VÉHICULES > UTILITAIRES
    // ————————————————————————————
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
      name: 'Kilométrage (km)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'utilitaires',
      name: 'Carburant',
      type: 'SELECT',
      options: ['Diesel', 'Essence', 'Électrique'],
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
    {
      categoryId: 'utilitaires',
      name: 'Volume utile (m³)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'utilitaires',
      name: 'Porte latérale',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'utilitaires',
      name: 'Climatisation',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // VÉHICULES > CAMIONS
    // ————————————————————————————
    { categoryId: 'camions', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'camions', name: 'Modèle', type: 'TEXT', required: false },
    { categoryId: 'camions', name: 'Année', type: 'NUMBER', required: true },
    {
      categoryId: 'camions',
      name: 'Kilométrage (km)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'camions',
      name: 'Carburant',
      type: 'SELECT',
      options: ['Diesel', 'Essence', 'Électrique', 'GNV'],
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
    {
      categoryId: 'camions',
      name: 'Nombre d’essieux',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'camions',
      name: 'Configuration',
      type: 'SELECT',
      options: [
        'Benne',
        'Plateau',
        'Fourgon',
        'Frigo',
        'Bâché',
        'Citerne',
        'Ampliroll',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'camions',
      name: 'Hayon élévateur',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // VÉHICULES > NAUTISME
    // ————————————————————————————
    {
      categoryId: 'nautisme',
      name: 'Type de bateau',
      type: 'SELECT',
      options: [
        'Voilier',
        'Bateau à moteur',
        'Semi-rigide',
        'Péniche',
        'Jet-ski',
      ],
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
      name: 'Largeur (m)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'nautisme',
      name: 'Nombre de couchages',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'nautisme',
      name: 'Motorisation',
      type: 'SELECT',
      options: ['Hors-bord', 'In-bord', 'Voile', 'Mixte'],
      required: false,
    },
    {
      categoryId: 'nautisme',
      name: 'Puissance moteur (cv)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'nautisme',
      name: 'Nombre de moteurs',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'nautisme',
      name: 'Armement sécurité',
      type: 'SELECT',
      options: ['Basique', 'Côtier', 'Hauturier'],
      required: false,
    },

    // ————————————————————————————
    // IMMOBILIER > VENTES
    // ————————————————————————————
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
      options: [
        'Appartement',
        'Maison',
        'Studio',
        'Loft',
        'Duplex',
        'Terrain',
        'Autre',
      ],
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
    { categoryId: 'ventes', name: 'Étage', type: 'NUMBER', required: false },
    {
      categoryId: 'ventes',
      name: 'Ascenseur',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Parking/Stationnement',
      type: 'SELECT',
      options: ['Aucun', 'Parking', 'Box', 'Garage'],
      required: false,
    },
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
      name: 'État du bien',
      type: 'SELECT',
      options: ['Neuf', 'Rénové', 'Bon état', 'À rénover'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Chauffage',
      type: 'SELECT',
      options: ['Individuel', 'Collectif', 'Aucun'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Type de chauffage',
      type: 'SELECT',
      options: ['Électrique', 'Gaz', 'Pompe à chaleur', 'Bois', 'Fioul'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Cuisine',
      type: 'SELECT',
      options: ['Aucune', 'Aménagée', 'Équipée'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Exposition',
      type: 'SELECT',
      options: ['N', 'S', 'E', 'O', 'NE', 'NO', 'SE', 'SO'],
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Copropriété',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Charges copropriété (€ /mois)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ventes',
      name: 'Taxe foncière (€ /an)',
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
    {
      categoryId: 'ventes',
      name: 'Accès PMR',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // IMMOBILIER > LOCATIONS
    // ————————————————————————————
    {
      categoryId: 'locations',
      name: 'Type de bien',
      type: 'SELECT',
      options: ['Appartement', 'Maison', 'Studio', 'Loft', 'Duplex', 'Autre'],
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
      name: 'Parking/Stationnement',
      type: 'SELECT',
      options: ['Aucun', 'Parking', 'Box', 'Garage'],
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
      name: 'Type de bail',
      type: 'SELECT',
      options: [
        'Classique',
        'Meublé (1 an)',
        'Bail mobilité (1–10 mois)',
        'Colocation',
      ],
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Dépôt de garantie (€)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'Colocation acceptée',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations',
      name: 'APL/CAF accepté',
      type: 'BOOLEAN',
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

    // ————————————————————————————
    // IMMOBILIER > COLOCATIONS
    // ————————————————————————————
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
      name: 'Salle de bain privative',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'colocations',
      name: 'Dépôt de garantie (€)',
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

    // ————————————————————————————
    // IMMOBILIER > BUREAUX & COMMERCES
    // ————————————————————————————
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
      options: ['Bureau', 'Commerce', 'Local/Atelier'],
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
      name: 'Fibre optique',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Accès PMR',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'bureaux',
      name: 'Salle de réunion',
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

    // ————————————————————————————
    // VACANCES > LOCATIONS SAISONNIÈRES
    // ————————————————————————————
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
    {
      categoryId: 'locations_saisonnieres',
      name: 'Linge fourni',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Ménage inclus',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Arrivée autonome',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Nuitées minimum',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'locations_saisonnieres',
      name: 'Caution (€)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // EMPLOI > OFFRES
    // ————————————————————————————
    {
      categoryId: 'offres',
      name: 'Type de contrat',
      type: 'SELECT',
      options: ['CDI', 'CDD', 'Intérim', 'Freelance', 'Alternance', 'Stage'],
      required: true,
    },
    {
      categoryId: 'offres',
      name: 'Temps de travail',
      type: 'SELECT',
      options: ['Temps plein', 'Temps partiel'],
      required: true,
    },
    {
      categoryId: 'offres',
      name: 'Télétravail',
      type: 'SELECT',
      options: ['Aucun', 'Hybride', 'Temps plein'],
      required: false,
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
    {
      categoryId: 'offres',
      name: 'Tickets resto',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'offres',
      name: 'Mutuelle',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'offres',
      name: 'Transport remboursé',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // EMPLOI > DEMANDES
    // ————————————————————————————
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
      type: 'SELECT',
      options: ['Aucun', 'CAP/BEP', 'Bac', 'Bac+2', 'Bac+3/4', 'Bac+5 et plus'],
      required: false,
    },
    {
      categoryId: 'demandes',
      name: 'Type de contrat souhaité',
      type: 'SELECT',
      options: ['CDI', 'CDD', 'Intérim', 'Freelance', 'Alternance', 'Stage'],
      required: false,
    },
    {
      categoryId: 'demandes',
      name: 'Télétravail souhaité',
      type: 'SELECT',
      options: ['Aucun', 'Hybride', 'Temps plein'],
      required: false,
    },

    // ————————————————————————————
    // MODE > VÊTEMENTS
    // ————————————————————————————
    {
      categoryId: 'vetements',
      name: 'Genre',
      type: 'SELECT',
      options: ['Homme', 'Femme', 'Unisexe'],
      required: true,
    },
    {
      categoryId: 'vetements',
      name: 'Taille',
      type: 'SELECT',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Autre'],
      required: true,
    },
    { categoryId: 'vetements', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'vetements',
      name: 'Couleur',
      type: 'SELECT',
      options: [
        'Noir',
        'Blanc',
        'Gris',
        'Bleu',
        'Rouge',
        'Vert',
        'Beige',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'vetements',
      name: 'Matière',
      type: 'SELECT',
      options: [
        'Coton',
        'Laine',
        'Cuir',
        'Lin',
        'Synthétique',
        'Soie',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'vetements',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },
    {
      categoryId: 'vetements',
      name: 'Saison',
      type: 'SELECT',
      options: ['Été', 'Hiver', 'Mi-saison', 'Toutes saisons'],
      required: false,
    },

    // ————————————————————————————
    // MODE > CHAUSSURES
    // ————————————————————————————
    {
      categoryId: 'chaussures',
      name: 'Pointure (EU)',
      type: 'NUMBER',
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

    // ————————————————————————————
    // MODE > ACCESSOIRES & BAGAGERIE
    // ————————————————————————————
    {
      categoryId: 'accessoires',
      name: 'Type',
      type: 'SELECT',
      options: [
        'Sac',
        'Ceinture',
        'Casquette/Chapeau',
        'Écharpe',
        'Porte-monnaie',
        'Valise',
        'Autre',
      ],
      required: true,
    },
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

    // ————————————————————————————
    // MODE > MONTRES & BIJOUX
    // ————————————————————————————
    {
      categoryId: 'bijoux',
      name: 'Type',
      type: 'SELECT',
      options: [
        'Montre',
        'Bague',
        'Collier',
        'Bracelet',
        'Boucles d’oreilles',
        'Autre',
      ],
      required: true,
    },
    { categoryId: 'bijoux', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'bijoux',
      name: 'Matériau',
      type: 'SELECT',
      options: ['Or', 'Argent', 'Acier', 'Plaqué', 'Autre'],
      required: false,
    },
    {
      categoryId: 'bijoux',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },
    {
      categoryId: 'bijoux',
      name: 'Étanchéité (ATM)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // MAISON & JARDIN > AMEUBLEMENT
    // ————————————————————————————
    {
      categoryId: 'ameublement',
      name: 'Type',
      type: 'SELECT',
      options: [
        'Canapé',
        'Table',
        'Chaise',
        'Lit',
        'Armoire',
        'Bureau',
        'Rangement',
        'Autre',
      ],
      required: true,
    },
    {
      categoryId: 'ameublement',
      name: 'Matériau',
      type: 'SELECT',
      options: ['Bois', 'Métal', 'Verre', 'Tissu', 'Cuir', 'Autre'],
      required: false,
    },
    {
      categoryId: 'ameublement',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },
    {
      categoryId: 'ameublement',
      name: 'Longueur (cm)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ameublement',
      name: 'Profondeur (cm)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ameublement',
      name: 'Hauteur (cm)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // MAISON & JARDIN > ÉLECTROMÉNAGER
    // ————————————————————————————
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
      name: 'Classe énergie',
      type: 'SELECT',
      options: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'],
      required: false,
    },
    {
      categoryId: 'electromenager',
      name: 'Puissance (W)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'electromenager',
      name: 'Capacité (L/kg)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'electromenager',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // MAISON & JARDIN > DÉCORATION
    // ————————————————————————————
    { categoryId: 'decoration', name: 'Type', type: 'TEXT', required: true },
    { categoryId: 'decoration', name: 'Style', type: 'TEXT', required: false },
    {
      categoryId: 'decoration',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Bon état', 'Usé'],
      required: false,
    },

    // ————————————————————————————
    // MAISON & JARDIN > JARDIN & PLANTES
    // ————————————————————————————
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
    {
      categoryId: 'jardin',
      name: 'Âge (années)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // MAISON & JARDIN > BRICOLAGE
    // ————————————————————————————
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

    // ————————————————————————————
    // FAMILLE > ÉQUIPEMENT BÉBÉ
    // ————————————————————————————
    {
      categoryId: 'equipement_bebe',
      name: 'Type',
      type: 'SELECT',
      options: [
        'Poussette',
        'Siège auto',
        'Transat',
        'Lit bébé',
        'Chaise haute',
        'Autre',
      ],
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
      type: 'SELECT',
      options: ['0–6 mois', '6–12 mois', '12–24 mois', '2–4 ans', '4+ ans'],
      required: false,
    },
    {
      categoryId: 'equipement_bebe',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // FAMILLE > MOBILIER ENFANT
    // ————————————————————————————
    {
      categoryId: 'mobilier_enfant',
      name: 'Type',
      type: 'SELECT',
      options: ['Lit', 'Bureau', 'Armoire', 'Rangement', 'Chaise', 'Autre'],
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

    // ————————————————————————————
    // FAMILLE > VÊTEMENTS BÉBÉ
    // ————————————————————————————
    {
      categoryId: 'vetements_bebe',
      name: 'Taille',
      type: 'SELECT',
      options: [
        '0–3 mois',
        '3–6 mois',
        '6–12 mois',
        '12–18 mois',
        '18–24 mois',
        '2–3 ans',
        '3–4 ans',
      ],
      required: true,
    },
    {
      categoryId: 'vetements_bebe',
      name: 'Genre',
      type: 'SELECT',
      options: ['Garçon', 'Fille', 'Unisexe'],
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

    // ————————————————————————————
    // ÉLECTRONIQUE > SMARTPHONES
    // ————————————————————————————
    { categoryId: 'smartphones', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'smartphones', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'smartphones',
      name: 'Couleur',
      type: 'SELECT',
      options: [
        'Noir',
        'Blanc',
        'Gris',
        'Bleu',
        'Vert',
        'Rouge',
        'Or',
        'Argent',
        'Autre',
      ],
      required: false,
    },
    {
      categoryId: 'smartphones',
      name: 'Stockage',
      type: 'SELECT',
      options: ['64 Go', '128 Go', '256 Go', '512 Go', '1 To'],
      required: true,
    },
    {
      categoryId: 'smartphones',
      name: 'Taille écran (")',
      type: 'NUMBER',
      required: false,
    },
    { categoryId: 'smartphones', name: '5G', type: 'BOOLEAN', required: false },
    {
      categoryId: 'smartphones',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },
    {
      categoryId: 'smartphones',
      name: 'Débloqué tout opérateur',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'smartphones',
      name: 'Double SIM',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'smartphones',
      name: 'Facture disponible',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'smartphones',
      name: 'Boîte / accessoires',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // ÉLECTRONIQUE > ORDINATEURS
    // ————————————————————————————
    { categoryId: 'ordinateurs', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'ordinateurs', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'ordinateurs',
      name: 'Processeur',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'ordinateurs',
      name: 'RAM (Go)',
      type: 'NUMBER',
      required: true,
    },
    {
      categoryId: 'ordinateurs',
      name: 'Type de disque',
      type: 'SELECT',
      options: ['SSD', 'HDD', 'SSD + HDD'],
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
      name: 'Taille écran (")',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'ordinateurs',
      name: 'Carte graphique',
      type: 'TEXT',
      required: false,
    },
    {
      categoryId: 'ordinateurs',
      name: 'Tactile',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'ordinateurs',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },
    {
      categoryId: 'ordinateurs',
      name: 'Système',
      type: 'SELECT',
      options: ['Windows', 'macOS', 'Linux', 'ChromeOS'],
      required: false,
    },

    // ————————————————————————————
    // ÉLECTRONIQUE > PHOTO / AUDIO / VIDÉO
    // ————————————————————————————
    {
      categoryId: 'photo_audio_video',
      name: 'Type de produit',
      type: 'SELECT',
      options: [
        'Appareil photo',
        'Caméra',
        'Objectif',
        'Enceinte',
        'Casque audio',
        'Amplificateur',
      ],
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
      name: 'Résolution (MP)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'photo_audio_video',
      name: '4K',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'photo_audio_video',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // ÉLECTRONIQUE > TABLETTES & LISEUSES
    // ————————————————————————————
    { categoryId: 'tablettes', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'tablettes', name: 'Modèle', type: 'TEXT', required: true },
    {
      categoryId: 'tablettes',
      name: 'Stockage',
      type: 'SELECT',
      options: ['32 Go', '64 Go', '128 Go', '256 Go', '512 Go'],
      required: true,
    },
    {
      categoryId: 'tablettes',
      name: 'Taille écran (")',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'tablettes',
      name: 'Connectivité',
      type: 'SELECT',
      options: ['Wi-Fi', 'Wi-Fi + Cellular'],
      required: false,
    },
    {
      categoryId: 'tablettes',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Reconditionné', 'Occasion'],
      required: true,
    },

    // ————————————————————————————
    // ÉLECTRONIQUE > CONSOLES & JEUX
    // ————————————————————————————
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
      options: ['PC', 'PS5', 'PS4', 'Xbox', 'Switch', 'Autre'],
      required: true,
    },
    {
      categoryId: 'consoles',
      name: 'Stockage',
      type: 'SELECT',
      options: ['Aucun', '256 Go', '512 Go', '1 To', '2 To'],
      required: false,
    },
    { categoryId: 'consoles', name: 'Édition', type: 'TEXT', required: false },
    {
      categoryId: 'consoles',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // LOISIRS > ANTIQUITÉS & COLLECTIONS
    // ————————————————————————————
    {
      categoryId: 'antiques',
      name: 'Type de collection',
      type: 'TEXT',
      required: true,
    },
    { categoryId: 'antiques', name: 'Année', type: 'NUMBER', required: false },
    {
      categoryId: 'antiques',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // LOISIRS > INSTRUMENTS DE MUSIQUE
    // ————————————————————————————
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

    // ————————————————————————————
    // LOISIRS > LIVRES
    // ————————————————————————————
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
      name: 'Format',
      type: 'SELECT',
      options: ['Broché', 'Relié', 'Poche', 'eBook'],
      required: false,
    },
    { categoryId: 'livres', name: 'Année', type: 'NUMBER', required: false },
    { categoryId: 'livres', name: 'ISBN', type: 'TEXT', required: false },
    {
      categoryId: 'livres',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // LOISIRS > SPORT & PLEIN AIR
    // ————————————————————————————
    {
      categoryId: 'sport',
      name: 'Type de sport',
      type: 'SELECT',
      options: [
        'Fitness/Muscu',
        'Football',
        'Basket',
        'Cyclisme',
        'Running',
        'Sports de combat',
        'Randonnée',
        'Autre',
      ],
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

    // ————————————————————————————
    // LOISIRS > JEUX & JOUETS
    // ————————————————————————————
    {
      categoryId: 'jeux',
      name: 'Type',
      type: 'SELECT',
      options: ['Jeu de société', 'Puzzle', 'Jouet', 'Figurine', 'Autre'],
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
      name: 'Complet (pièces/règles)',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'jeux',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // ANIMAUX > ANIMAUX VIVANTS
    // ————————————————————————————
    {
      categoryId: 'animaux_vivants',
      name: 'Espèce',
      type: 'SELECT',
      options: ['Chien', 'Chat', 'Oiseau', 'Rongeur', 'Poisson', 'Autre'],
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
      name: 'Âge (mois/ans)',
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
      name: 'Pucé/Identifié',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Inscrit LOF/LOOF',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'animaux_vivants',
      name: 'Stérilisé',
      type: 'BOOLEAN',
      required: false,
    },

    // ————————————————————————————
    // ANIMAUX > ACCESSOIRES
    // ————————————————————————————
    {
      categoryId: 'accessoires_animaux',
      name: 'Type d’accessoire',
      type: 'SELECT',
      options: [
        'Laisse/Collier',
        'Niche/Cage',
        'Aquarium',
        'Litière',
        'Gamelle',
        'Jouet',
        'Autre',
      ],
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

    // ————————————————————————————
    // MATÉRIEL PRO > AGRICOLE
    // ————————————————————————————
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
      name: 'Largeur de travail (m)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'agricole',
      name: 'Puissance requise (cv)',
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

    // ————————————————————————————
    // MATÉRIEL PRO > MÉDICAL
    // ————————————————————————————
    { categoryId: 'medical', name: 'Spécialité', type: 'TEXT', required: true },
    { categoryId: 'medical', name: 'Marque', type: 'TEXT', required: false },
    { categoryId: 'medical', name: 'Année', type: 'NUMBER', required: false },
    {
      categoryId: 'medical',
      name: 'Conforme CE',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'medical',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // MATÉRIEL PRO > INDUSTRIEL
    // ————————————————————————————
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
      name: 'Tension (V)',
      type: 'NUMBER',
      required: false,
    },
    {
      categoryId: 'industriel',
      name: 'Triphasé',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'industriel',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },

    // ————————————————————————————
    // SERVICES > BABY-SITTING
    // ————————————————————————————
    {
      categoryId: 'baby_sitting',
      name: 'Âge enfants pris en charge',
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
    {
      categoryId: 'baby_sitting',
      name: 'Permis B',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'baby_sitting',
      name: 'Véhicule',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'baby_sitting',
      name: 'Soirs/Week-end',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'baby_sitting',
      name: 'Taux horaire (€)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // SERVICES > COURS PARTICULIERS
    // ————————————————————————————
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
    {
      categoryId: 'cours_particuliers',
      name: 'Format',
      type: 'SELECT',
      options: ['À domicile', 'En ligne', 'Mixte'],
      required: false,
    },
    {
      categoryId: 'cours_particuliers',
      name: 'Tarif horaire (€)',
      type: 'NUMBER',
      required: false,
    },

    // ————————————————————————————
    // SERVICES > JARDINAGE & BRICOLAGE
    // ————————————————————————————
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
    {
      categoryId: 'jardinage',
      name: 'Débarras des déchets',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'jardinage',
      name: 'Assurance pro',
      type: 'BOOLEAN',
      required: false,
    },
    {
      categoryId: 'jardinage',
      name: 'Tarif horaire (€)',
      type: 'NUMBER',
      required: false,
    },
  ];

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
