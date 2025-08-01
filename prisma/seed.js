// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DynamicField = {
  categoryId: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
  options?: string[];
  required: boolean;
};

async function main() {
  // Liste des catégories principales et sous-catégories
  const categories = [
    {
      id: 'vehicules', name: 'Véhicules', icon: '🚗', allowRent: true,
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
      id: 'immobilier', name: 'Immobilier', icon: '🏠', allowRent: true,
      children: [
        { id: 'ventes', name: 'Ventes immobilières', icon: '🔑', allowRent: false },
        { id: 'locations', name: 'Locations', icon: '📃', allowRent: true },
        { id: 'colocations', name: 'Colocations', icon: '👥', allowRent: true },
        { id: 'bureaux', name: 'Bureaux & Commerces', icon: '🏬', allowRent: true },
      ],
    },
    {
      id: 'vacances', name: 'Vacances', icon: '🏖️', allowRent: true,
      children: [
        { id: 'locations_saisonnieres', name: 'Locations saisonnières', icon: '🏡', allowRent: true },
      ],
    },
    {
      id: 'emploi', name: 'Emploi', icon: '💼', allowRent: false,
      children: [
        { id: 'offres', name: 'Offres d’emploi', icon: '📢', allowRent: false },
        { id: 'demandes', name: 'Demandes d’emploi', icon: '📩', allowRent: false },
      ],
    },
    {
      id: 'mode', name: 'Mode', icon: '👗', allowRent: false,
      children: [
        { id: 'vetements', name: 'Vêtements', icon: '👚', allowRent: false },
        { id: 'chaussures', name: 'Chaussures', icon: '👟', allowRent: false },
        { id: 'accessoires', name: 'Accessoires & Bagagerie', icon: '👜', allowRent: false },
        { id: 'bijoux', name: 'Montres & Bijoux', icon: '💍', allowRent: false },
      ],
    },
    {
      id: 'maison_jardin', name: 'Maison & Jardin', icon: '🏡', allowRent: false,
      children: [
        { id: 'ameublement', name: 'Ameublement', icon: '🛋️', allowRent: false },
        { id: 'electromenager', name: 'Électroménager', icon: '🍳', allowRent: false },
        { id: 'decoration', name: 'Décoration', icon: '🖼️', allowRent: false },
        { id: 'jardin', name: 'Jardin & Plantes', icon: '🌱', allowRent: false },
        { id: 'bricolage', name: 'Bricolage', icon: '🔨', allowRent: false },
      ],
    },
    {
      id: 'famille', name: 'Famille (Puériculture)', icon: '🍼', allowRent: false,
      children: [
        { id: 'equipement_bebe', name: 'Équipement bébé', icon: '👶', allowRent: false },
        { id: 'mobilier_enfant', name: 'Mobilier enfant', icon: '🛏️', allowRent: false },
        { id: 'vetements_bebe', name: 'Vêtements bébé', icon: '🧸', allowRent: false },
      ],
    },
    {
      id: 'electronique', name: 'Électronique', icon: '📱', allowRent: false,
      children: [
        { id: 'smartphones', name: 'Smartphones', icon: '📱', allowRent: false },
        { id: 'ordinateurs', name: 'Ordinateurs', icon: '💻', allowRent: false },
        { id: 'photo_audio_video', name: 'Photo/Audio/Vidéo', icon: '📷', allowRent: false },
        { id: 'tablettes', name: 'Tablettes & Liseuses', icon: '📚', allowRent: false },
        { id: 'consoles', name: 'Consoles & Jeux vidéo', icon: '🎮', allowRent: false },
      ],
    },
    {
      id: 'loisirs', name: 'Loisirs', icon: '🎉', allowRent: false,
      children: [
        { id: 'antiques', name: 'Antiquités & Collections', icon: '🏺', allowRent: false },
        { id: 'instruments', name: 'Instruments de musique', icon: '🎵', allowRent: false },
        { id: 'livres', name: 'Livres', icon: '📚', allowRent: false },
        { id: 'sport', name: 'Sport & Plein air', icon: '🏀', allowRent: false },
        { id: 'jeux', name: 'Jeux & Jouets', icon: '🧩', allowRent: false },
      ],
    },
    {
      id: 'animaux', name: 'Animaux', icon: '🐾', allowRent: false,
      children: [
        { id: 'animaux_vivants', name: 'Animaux vivants', icon: '🐶', allowRent: false },
        { id: 'accessoires_animaux', name: 'Accessoires animaux', icon: '🐱', allowRent: false },
      ],
    },
    {
      id: 'materiel_pro', name: 'Matériel professionnel', icon: '🏭', allowRent: false,
      children: [
        { id: 'agricole', name: 'Matériel agricole', icon: '🚜', allowRent: false },
        { id: 'medical', name: 'Matériel médical', icon: '🩺', allowRent: false },
        { id: 'industriel', name: 'Équipements industriels', icon: '⚙️', allowRent: false },
      ],
    },
    {
      id: 'services', name: 'Services', icon: '🛎️', allowRent: false,
      children: [
        { id: 'baby_sitting', name: 'Baby-Sitting', icon: '👶', allowRent: false },
        { id: 'cours_particuliers', name: 'Cours particuliers', icon: '📖', allowRent: false },
        { id: 'jardinage', name: 'Jardinage & Bricolage', icon: '🌿', allowRent: false },
      ],
    },
    {
      id: 'autres', name: 'Autres/Divers', icon: '🔄', allowRent: false,
      children: [
        { id: 'divers', name: 'Divers', icon: '❓', allowRent: false },
      ],
    },
  ];

  // Upsert catégories et sous-catégories
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

  // Champs dynamiques pour chaque sous-catégorie
  const fields: DynamicField[] = [
    // Voitures
    { categoryId: 'voitures', name: 'Marque', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Modèle', type: 'TEXT', required: true },
    { categoryId: 'voitures', name: 'Kilométrage', type: 'NUMBER', required: true },
    { categoryId: 'voitures', name: 'Année', type: 'NUMBER', required: true },
    { categoryId: 'voitures', name: 'Carburant', type: 'SELECT', options: ['Essence','Diesel','Hybride','Électrique'], required: true },
    { categoryId: 'voitures', name: 'Boîte de vitesses', type: 'SELECT', options: ['Manuelle','Automatique'], required: true },
    ...
    // (Poursuivre pour chaque sous-catégorie avec 3-5 champs appropriés)
  ];

  // Création des champs dynamiques
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
