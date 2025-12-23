import { Loader2 } from 'lucide-react';

interface LoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ message = 'Chargement...', size = 'md' }: LoaderProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
            <p className="text-gray-400 text-sm animate-pulse">{message}</p>
        </div>
    );
}

// Skeleton loader pour tableaux
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {[...Array(rows)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg animate-pulse">
                    <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-700 rounded"></div>
                </div>
            ))}
        </div>
    );
}