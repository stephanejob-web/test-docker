import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    total?: number;
    itemsPerPage?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    total,
    itemsPerPage
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-gray-800">
            {/* Info */}
            {total && itemsPerPage && (
                <div className="text-sm text-gray-400">
                    Affichage de <span className="font-medium text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> à{' '}
                    <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, total)}</span> sur{' '}
                    <span className="font-medium text-white">{total}</span> résultats
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Précédent</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                    {getPageNumbers().map((page, idx) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-gray-500">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={page}
                                size="sm"
                                variant={currentPage === page ? 'primary' : 'ghost'}
                                onClick={() => onPageChange(page as number)}
                                className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* Next Page */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <span className="hidden sm:inline mr-1">Suivant</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
