import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Input, Label } from './ui';

interface DateTimeInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    minDateTime?: string;
    error?: string;
}

export default function DateTimeInput({
    label,
    value,
    onChange,
    required = false,
    minDateTime,
    error
}: DateTimeInputProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Parse initial value into date and time
    useEffect(() => {
        if (value) {
            const [datePart, timePart] = value.split('T');
            setDate(datePart || '');
            setTime(timePart || '');
        }
    }, [value]);

    // Combine date and time when either changes
    useEffect(() => {
        if (date && time) {
            onChange(`${date}T${time}`);
        } else if (date || time) {
            // If only one is set, still update (for partial input)
            onChange(date && time ? `${date}T${time}` : '');
        }
    }, [date, time]);

    const handleQuickAction = (action: 'today' | 'tomorrow' | 'next-week') => {
        const now = new Date();
        const targetDate = new Date();

        switch (action) {
            case 'today':
                targetDate.setHours(now.getHours() + 1, 0, 0, 0);
                break;
            case 'tomorrow':
                targetDate.setDate(now.getDate() + 1);
                targetDate.setHours(10, 0, 0, 0);
                break;
            case 'next-week':
                targetDate.setDate(now.getDate() + 7);
                targetDate.setHours(10, 0, 0, 0);
                break;
        }

        const dateStr = targetDate.toISOString().split('T')[0];
        const timeStr = targetDate.toTimeString().slice(0, 5);
        setDate(dateStr);
        setTime(timeStr);
    };

    const formatDisplayDate = () => {
        if (!date) return null;
        const d = new Date(date + 'T00:00');
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(d);
    };

    return (
        <div className="space-y-3">
            <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                {label} {required && <span className="text-red-400">*</span>}
            </Label>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => handleQuickAction('today')}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                >
                    Aujourd'hui
                </button>
                <button
                    type="button"
                    onClick={() => handleQuickAction('tomorrow')}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors border border-purple-500/20"
                >
                    Demain
                </button>
                <button
                    type="button"
                    onClick={() => handleQuickAction('next-week')}
                    className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 rounded-md hover:bg-green-500/20 transition-colors border border-green-500/20"
                >
                    Dans 7 jours
                </button>
            </div>

            {/* Date and Time Inputs */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required={required}
                            min={minDateTime ? minDateTime.split('T')[0] : undefined}
                            className={`pl-10 bg-background border-gray-700 focus:border-blue-500 ${error ? 'border-red-500' : ''
                                }`}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required={required}
                            className={`pl-10 bg-background border-gray-700 focus:border-blue-500 ${error ? 'border-red-500' : ''
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Display Formatted Date */}
            {date && time && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400 font-medium capitalize">
                        {formatDisplayDate()} à {time}
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                    {error}
                </p>
            )}
        </div>
    );
}
