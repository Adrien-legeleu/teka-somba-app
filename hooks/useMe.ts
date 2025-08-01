import { useEffect, useState } from 'react';

export function useMe() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        console.log('Données utilisateur reçues :', data);
        setMe(data);
      })

      .finally(() => setLoading(false));
  }, []);

  return { me, loading };
}
