import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Liste des catégories principales avec leurs enfants
  const categories = [
    {
      id: 'vehicules',
      name: 'Véhicules',
      icon: '🚗',
      allowRent: true,
      children: [
        { id: 'voitures', name: 'Voitures', icon: '🚙', allowRent: true },
        { id: 'motos', name: 'Motos', icon: '🏍️', allowRent: false },
      ],
    },
    {
      id: 'immobilier',
      name: 'Immobilier',
      icon: '🏠',
      allowRent: true,
      children: [
        {
          id: 'appartements',
          name: 'Appartements',
          icon: '🏢',
          allowRent: true,
        },
        { id: 'maisons', name: 'Maisons', icon: '🏡', allowRent: true },
      ],
    },
    {
      id: 'electronique',
      name: 'Électronique',
      icon: '💻',
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
          icon: '🖥️',
          allowRent: false,
        },
      ],
    },
    {
      id: 'mode',
      name: 'Mode',
      icon: '👕',
      allowRent: false,
      children: [
        { id: 'vetements', name: 'Vêtements', icon: '👚', allowRent: false },
        { id: 'chaussures', name: 'Chaussures', icon: '👟', allowRent: false },
      ],
    },
  ];

  for (const parent of categories) {
    // Upsert de la catégorie parent
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

  // Champs dynamiques à ajouter
  const fields = [
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
    { categoryId: 'vetements', name: 'Taille', type: 'TEXT', required: true },
    { categoryId: 'vetements', name: 'Marque', type: 'TEXT', required: false },
    {
      categoryId: 'vetements',
      name: 'État',
      type: 'SELECT',
      options: ['Neuf', 'Très bon état', 'Bon état', 'Usé'],
      required: true,
    },
    {
      categoryId: 'chaussures',
      name: 'Pointure',
      type: 'TEXT',
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
    { categoryId: 'smartphones', name: 'Modèle', type: 'TEXT', required: true },
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
    { categoryId: 'ordinateurs', name: 'Modèle', type: 'TEXT', required: true },
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
  .then(() => {
    console.log('✅ Seed sécurisé terminé (aucune suppression)');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
