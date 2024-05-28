'use client';

import { useState } from 'react';
const useFetch = <T,>(url: string, method: string, body?: any) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchData = async (dataToSend?: FormData | object) => {
    try {
      const response = await fetch(url, {
        method,
        body: dataToSend ? JSON.stringify(dataToSend) : null,
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData: T = await response.json();
      setData(jsonData);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };
  return { data, isLoading, error, fetchData };
};
export default useFetch;
