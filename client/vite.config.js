import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['apple-touch-icon.png'],
            manifest: {
                name: 'Gather',
                short_name: 'Gather',
                description: 'Make friends as an adult — small circles, one video meetup at a time.',
                theme_color: '#E26D5C',
                background_color: '#FAF7F2',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'icon-maskable-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                // Cache the app shell + assets so the landing/onboarding pages
                // load offline. API calls fall through to the network.
                globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkOnly',
                    },
                ],
            },
        }),
    ],
    server: { port: 5173 },
});
