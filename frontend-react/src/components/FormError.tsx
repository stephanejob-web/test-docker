import { AlertCircle } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

interface FormErrorProps {
  error?: FieldError | { message?: string };
}

export default function FormError({ error }: FormErrorProps) {
  if (!error || !error.message) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-red-400 mt-1">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
}

// Composant pour afficher plusieurs erreurs (erreurs backend structurées)
interface BackendErrorsProps {
  errors?: Array<{ field: string; message: string }>;
}

export function BackendErrors({ errors }: BackendErrorsProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="p-3 bg-red-900/20 border border-red-800 rounded-md space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-red-400">
        <AlertCircle className="w-4 h-4" />
        <span>Erreurs de validation</span>
      </div>
      <ul className="ml-6 space-y-0.5 text-sm text-red-300">
        {errors.map((error, index) => (
          <li key={index} className="list-disc">
            <span className="font-medium">{error.field}</span> : {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
