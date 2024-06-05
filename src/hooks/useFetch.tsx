'use client';

import { useState } from 'react';

const useFetch = <T,>(url: string, method: string) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const jsonData: T = await response.json();
      setData(jsonData);
      return jsonData;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, isLoading, error, fetchData };
};

export default useFetch;
