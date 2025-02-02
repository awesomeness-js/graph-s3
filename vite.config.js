import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
    },
    test: {
        // Add your Vitest-specific configurations here if needed
        setupFiles: './vitest.setup.js',
    },
});
