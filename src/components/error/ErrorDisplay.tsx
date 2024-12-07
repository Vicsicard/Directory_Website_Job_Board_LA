'use client';

import { ErrorInfo } from 'react';
import Link from 'next/link';

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

export default function ErrorDisplay({ error, errorInfo, onReset }: ErrorDisplayProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Oops! Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {isDevelopment && errorInfo && (
                <div className="mt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-900">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-96 p-4 bg-gray-50 rounded">
                      {error.stack}
                      {'\n\nComponent Stack:\n'}
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                {onReset && (
                  <button
                    onClick={onReset}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            If this error persists, please{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
