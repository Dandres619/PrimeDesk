import { useState, useEffect } from 'react';

export function useMotorcycleData() {
  const [data, setData] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the pre-processed JSON
    import('../motocicletas_dataset/motorcycles.json')
      .then((module) => {
        setData(module.default);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading motorcycle dataset:', err);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
