import { useState, useEffect, useRef } from 'react';

interface StripeSession {
  customer_details: {
    name: string | null;
    email: string | null;
  };
  amount_total: number;
  currency: string;
  payment_status: string;
}

export function useStripeSession(sessionId: string | null, sharedSecret: string) {
  const [session, setSession] = useState<StripeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const fetchController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!sessionId || !sharedSecret) {
      setLoading(false);
      setError(undefined);
      return;
    }

    // Abort previous fetch if it exists
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // Create new abort controller for this fetch
    fetchController.current = new AbortController();

    async function fetchSession() {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch(
          `https://payment-processor-856401495068.us-central1.run.app/stripe/session/${sessionId}`,
          {
            headers: {
              'x-shared-secret': sharedSecret,
              'Accept': 'application/json'
            },
            signal: fetchController.current?.signal
          }
        );
        
        if (!response.ok) {
          throw new Error(
            `Failed to fetch session: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setSession(data);
      } catch (err) {
        // Only set error if it's not an abort error
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          setSession(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSession();

    // Cleanup function to abort fetch on unmount or sessionId change
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, [sessionId, sharedSecret]); // Re-run if sessionId or sharedSecret changes

  return { session, loading, error };
}