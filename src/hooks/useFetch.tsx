'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

class CustomError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export enum AcceptedMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum FetchStates {
  LOADING = 'loading',
  ERROR = 'error',
  IDLE = 'idle',
  SUCCESS = 'success',
}

type HTTPMethods = keyof typeof AcceptedMethods;

interface UseFetchProps<TData, TError> {
  url: string;
  method: HTTPMethods;
  headers?: HeadersInit;
  authorized?: boolean;
  authTokenVariable?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onUnAuthorisedAccessError?: () => void;
}

// interface ApiResponse<TData> {
//   data: TData;
//   message?: string;
// }

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

export const useFetch = <TData = unknown, TError = ApiError>({
  url,
  method,
  headers = {},
  onSuccess,
  onError,
  onUnAuthorisedAccessError,
}: UseFetchProps<TData, TError>) => {
  const router = useRouter();
  const dataRef = useRef<TData | null>(null);
  const [fetchState, setFetchState] = useState<FetchStates>(FetchStates.IDLE);
  const errorRef = useRef<TError | null>(null);

  const handleUnAuthorisedAccessError = useCallback(() => {
    setFetchState(FetchStates.ERROR);
    if (onUnAuthorisedAccessError) {
      onUnAuthorisedAccessError();
      return;
    }
    toast.error('Please login');
    router.push('/auth/signin');
    localStorage.clear();
  }, [onUnAuthorisedAccessError]);

  const doFetch = useCallback(
    async (
      dataToSend?: Record<string, unknown> | FormData,
      modifiedUrl?: string
    ) => {
      setFetchState(FetchStates.LOADING);
      try {
        const fetchHeaders: HeadersInit = new Headers(headers);

        if (method !== AcceptedMethods.GET && dataToSend) {
          // eslint-disable-next-line no-empty
          if (dataToSend instanceof FormData) {
          } else {
            fetchHeaders.set('Content-Type', 'application/json');
          }
        }

        const fetchOptions: RequestInit = {
          method,
          headers: fetchHeaders,
        };
        if (dataToSend) {
          console.log(dataToSend, 'dataToSend');
          fetchOptions.body =
            dataToSend instanceof FormData
              ? dataToSend
              : JSON.stringify(dataToSend);
        }
        if (modifiedUrl) {
          url = modifiedUrl;
        }
        const req = await fetch(url, fetchOptions);
        if (!req.ok) {
          if (req.status === 401) {
            console.log(url, '401 redirect ' + url);
            handleUnAuthorisedAccessError();
            return;
          }
          const err = await req.json();
          console.log(url, err, 'usefetch err');
          if (req.statusText) throw new CustomError(err.message, req.status);
        }
        const res: TData = await req.json();
        if (onSuccess) {
          onSuccess(res);
        }
        setFetchState(FetchStates.SUCCESS);
        dataRef.current = res;
      } catch (error) {
        console.error(error, 'error from useFetch', url);
        setFetchState(FetchStates.ERROR);
        errorRef.current = error as TError;
        if (onError) {
          onError(error as TError);
        } else {
          toast.error('Something went wrong');
        }
      }
    },
    [url, method, headers, onSuccess, onError]
  );

  return { fetchState, dataRef, errorRef, doFetch };
};
