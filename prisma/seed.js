const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Suppressions dans le bon ordre
  await prisma.ad.deleteMany();
  await prisma.adField.deleteMany();
  await prisma.categoryField.deleteMany();
  await prisma.category.deleteMany();

  await prisma.category.create({
    data: {
      id: 'vehicules',
      name: 'Véhicules',
      icon: '🚗',
      allowRent: true,
      children: {
        create: [
          { id: 'voitures', name: 'Voitures', icon: '🚙', allowRent: true },
          { id: 'motos', name: 'Motos', icon: '🏍️', allowRent: false },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      id: 'immobilier',
      name: 'Immobilier',
      icon: '🏠',
      allowRent: true,
      children: {
        create: [
          {
            id: 'appartements',
            name: 'Appartements',
            icon: '🏢',
            allowRent: true,
          },
          { id: 'maisons', name: 'Maisons', icon: '🏡', allowRent: true },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      id: 'electronique',
      name: 'Électronique',
      icon: '💻',
      allowRent: false,
      children: {
        create: [
          {
            id: 'smartphones',
            name: 'Smartphones',
            icon: '📱',
            allowRent: false,
          },
          {
            id: 'ordinateurs',
            name: 'Ordinateurs',
            icon: '🖥️',
            allowRent: false,
          },
        ],
      },
    },
  });

  await prisma.category.create({
    data: {
      id: 'mode',
      name: 'Mode',
      icon: '👕',
      allowRent: false,
      children: {
        create: [
          { id: 'vetements', name: 'Vêtements', icon: '👚', allowRent: false },
          {
            id: 'chaussures',
            name: 'Chaussures',
            icon: '👟',
            allowRent: false,
          },
        ],
      },
    },
  });

  // Ajout des champs dynamiques

  await prisma.categoryField.createMany({
    data: [
      // Voitures
      { categoryId: 'voitures', name: 'Marque', type: 'TEXT', required: true },
      {
        categoryId: 'voitures',
        name: 'Kilométrage',
        type: 'NUMBER',
        required: true,
      },
      { categoryId: 'voitures', name: 'Année', type: 'NUMBER', required: true },
      {
        categoryId: 'voitures',
        name: 'Boîte de vitesses',
        type: 'SELECT',
        options: ['Manuelle', 'Automatique'],
        required: false,
      },

      // Appartements
      {
        categoryId: 'appartements',
        name: 'Nombre de pièces',
        type: 'NUMBER',
        required: true,
      },
      {
        categoryId: 'appartements',
        name: 'Surface (m²)',
        type: 'NUMBER',
        required: true,
      },
      {
        categoryId: 'appartements',
        name: 'Meublé',
        type: 'SELECT',
        options: ['Oui', 'Non'],
        required: false,
      },

      // Vêtements
      { categoryId: 'vetements', name: 'Taille', type: 'TEXT', required: true },
      {
        categoryId: 'vetements',
        name: 'Marque',
        type: 'TEXT',
        required: false,
      },
      {
        categoryId: 'vetements',
        name: 'État',
        type: 'SELECT',
        options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
        required: true,
      },

      // Chaussures
      {
        categoryId: 'chaussures',
        name: 'Pointure',
        type: 'TEXT',
        required: true,
      },
      {
        categoryId: 'chaussures',
        name: 'Marque',
        type: 'TEXT',
        required: false,
      },
      {
        categoryId: 'chaussures',
        name: 'État',
        type: 'SELECT',
        options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
        required: true,
      },

      // Smartphones
      {
        categoryId: 'smartphones',
        name: 'Modèle',
        type: 'TEXT',
        required: true,
      },
      {
        categoryId: 'smartphones',
        name: 'Stockage',
        type: 'SELECT',
        options: ['64 Go', '128 Go', '256 Go'],
        required: true,
      },
      {
        categoryId: 'smartphones',
        name: 'État',
        type: 'SELECT',
        options: ['Neuf', 'Reconditionné', 'Occasion'],
        required: true,
      },

      // Ordinateurs
      {
        categoryId: 'ordinateurs',
        name: 'Modèle',
        type: 'TEXT',
        required: true,
      },
      {
        categoryId: 'ordinateurs',
        name: 'Mémoire RAM',
        type: 'TEXT',
        required: true,
      },
      {
        categoryId: 'ordinateurs',
        name: 'Type de disque',
        type: 'SELECT',
        options: ['SSD', 'HDD'],
        required: true,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('✅ Seed terminé avec champs dynamiques');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
