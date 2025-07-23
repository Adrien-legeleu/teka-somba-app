import { prisma } from '@/lib/prisma';

async function main() {
  await prisma.premiumOffer.createMany({
    data: [
      {
        title: 'Boost hebdomadaire',
        description: 'Votre annonce remonte en tête pendant 7 jours.',
        price: 5000,
        duration: 7,
        type: 'BOOST_HEBDO',
      },
      {
        title: 'Boost journalier',
        description: 'Votre annonce remonte chaque jour pendant 7 jours.',
        price: 1000,
        duration: 7,
        type: 'BOOST_JOURNALIER',
      },
      {
        title: 'Mise en avant VIP',
        description: 'Badge Premium et priorité dans les résultats.',
        price: 15000,
        duration: 30,
        type: 'VIP',
      },
    ],
  });
}

main().catch(console.error);
