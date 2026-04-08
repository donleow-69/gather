/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                gather: {
                    bg: '#FAF6EF',          // warm cream
                    'bg-deep': '#F3EBE0',   // slightly darker cream
                    ink: '#2A2520',         // warm dark brown
                    'ink-soft': '#5A4F47',  // muted brown
                    accent: '#E26D5C',      // terracotta
                    'accent-deep': '#C45A4A',
                    gold: '#C9A87C',        // muted gold
                    blush: '#F4D5C5',       // terracotta tint
                },
            },
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                warm: '0 1px 2px rgba(42, 37, 32, 0.04), 0 8px 24px rgba(42, 37, 32, 0.06)',
                'warm-lg': '0 2px 4px rgba(42, 37, 32, 0.05), 0 16px 40px rgba(42, 37, 32, 0.08)',
            },
        },
    },
    plugins: [],
};
