'use client';

import { useEffect } from 'react';
import ErrorDisplay from '@/components/error/ErrorDisplay';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to your error tracking service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <ErrorDisplay
          error={error}
          errorInfo={null}
          onReset={reset}
        />
      </body>
    </html>
  );
}
