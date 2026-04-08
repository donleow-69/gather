// Generate Gather PWA icons: a solid terracotta square with a centered white "G".
// Run: node scripts/generate-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
mkdirSync(PUBLIC_DIR, { recursive: true });

// Terracotta theme color
const BG = { r: 0xe2, g: 0x6d, b: 0x5c };
const FG = { r: 0xff, g: 0xff, b: 0xff };

// 7x7 bitmap for the letter "G"
// 1 = foreground (white), 0 = background (terracotta)
const LETTER_G = [
    [0, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 0],
];

function generateIcon(size, outPath) {
    const png = new PNG({ width: size, height: size });

    // Letter occupies ~60% of the icon, centered
    const cell = Math.floor((size * 0.6) / LETTER_G.length);
    const letterSize = cell * LETTER_G.length;
    const offsetX = Math.floor((size - letterSize) / 2);
    const offsetY = Math.floor((size - letterSize) / 2);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (size * y + x) << 2;

            // Default: terracotta background
            let color = BG;

            // Inside the letter region?
            const lx = x - offsetX;
            const ly = y - offsetY;
            if (lx >= 0 && lx < letterSize && ly >= 0 && ly < letterSize) {
                const gx = Math.floor(lx / cell);
                const gy = Math.floor(ly / cell);
                if (LETTER_G[gy]?.[gx] === 1) {
                    color = FG;
                }
            }

            png.data[idx] = color.r;
            png.data[idx + 1] = color.g;
            png.data[idx + 2] = color.b;
            png.data[idx + 3] = 0xff; // fully opaque
        }
    }

    writeFileSync(outPath, PNG.sync.write(png));
    console.log(`wrote ${outPath} (${size}x${size})`);
}

generateIcon(192, resolve(PUBLIC_DIR, 'icon-192.png'));
generateIcon(512, resolve(PUBLIC_DIR, 'icon-512.png'));
generateIcon(180, resolve(PUBLIC_DIR, 'apple-touch-icon.png'));
// Maskable icon — same image works because the "G" is well within the safe zone
generateIcon(512, resolve(PUBLIC_DIR, 'icon-maskable-512.png'));
