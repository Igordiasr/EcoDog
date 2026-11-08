import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localPetImages } from './scripts/local-pet-images.mjs';
export default defineConfig({
    plugins: [react(), tailwindcss(), localPetImages()],
});
