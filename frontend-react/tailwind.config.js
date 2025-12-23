/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563EB', // Vibrant Blue
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#F3F4F6',
                    foreground: '#1F2937',
                },
                accent: {
                    DEFAULT: '#8B5CF6', // Purple for spiritual touch
                    foreground: '#FFFFFF',
                },
                background: '#0F172A', // Deep dark blue/slate
                surface: '#1E293B',
                muted: '#64748B',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
