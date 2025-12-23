import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'Au moins 8 caractères',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Au moins une majuscule',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Au moins une minuscule',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Au moins un chiffre',
    test: (pwd) => /[0-9]/.test(pwd),
  },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const validRequirements = requirements.filter((req) => req.test(password)).length;
  const strength = (validRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 100) return 'bg-green-500';
    if (strength >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = () => {
    if (strength === 100) return 'Fort';
    if (strength >= 50) return 'Moyen';
    return 'Faible';
  };

  const getStrengthTextColor = () => {
    if (strength === 100) return 'text-green-400';
    if (strength >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Force du mot de passe</span>
          <span className={`font-medium ${getStrengthTextColor()}`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Liste des critères */}
      <div className="space-y-1">
        {requirements.map((req, index) => {
          const isValid = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              )}
              <span className={isValid ? 'text-green-400' : 'text-muted'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Fonction utilitaire pour vérifier si le mot de passe est valide
export function isPasswordValid(password: string): boolean {
  return requirements.every((req) => req.test(password));
}