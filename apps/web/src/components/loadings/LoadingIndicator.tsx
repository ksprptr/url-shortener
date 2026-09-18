import { LoaderCircle } from 'lucide-react';

/**
 * Spinner used inside buttons and toasts.
 **/
export default function LoadingIndicator({ className = 'h-4 w-4' }: { className?: string }) {
  return <LoaderCircle className={`animate-spin ${className}`} aria-hidden />;
}
