export const dynamic = 'force-dynamic';

// prettier-ignore
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Transaction = {
  id: string;
  amount: number;
  type: 'RECHARGE' | 'PURCHASE';
  metadata: string | null;
  createdAt: string;
};

type Purchase = {
  id: string;
  createdAt: string;
  ad: { title: string };
  offer: {
    title: string;
    price: number;
    description: string;
  };
};

export default function FacturePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    fetch('/api/factures')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions);
        setPurchases(data.purchases);
      });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <h2 className="text-2xl font-bold">Historique des paiements</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          💳 Transactions (crédits)
        </h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aucune transaction enregistrée.</p>
        ) : (
          <ul className="divide-y">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {tx.type === 'RECHARGE'
                      ? 'Recharge'
                      : 'Achat de fonctionnalité'}
                  </p>
                  <p className="text-sm text-gray-500">{tx.metadata || '-'}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} crédits
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy à HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          ⭐ Fonctionnalités Premium achetées
        </h3>
        {purchases.length === 0 ? (
          <p className="text-gray-500">
            Aucune fonctionnalité Premium achetée.
          </p>
        ) : (
          <ul className="divide-y">
            {purchases.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{p.offer.title}</p>
                    <p className="text-sm text-gray-500">
                      {p.offer.description} <br />
                      <span className="text-muted-foreground">
                        Annonce : {p.ad.title}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      - {p.offer.price} crédits
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(p.createdAt), 'dd MMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
