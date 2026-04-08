/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                gather: {
                    bg: '#FAF7F2',
                    ink: '#1F2937',
                    accent: '#E26D5C',
                },
            },
        },
    },
    plugins: [],
};
