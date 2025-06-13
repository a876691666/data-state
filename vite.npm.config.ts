import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'url';
import packageJson from './package.json';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [
		dts({
			outDir: 'dist',
			insertTypesEntry: true,
		})
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: packageJson.name,
			fileName: (format) => `index.${format}.js`,
		},
		outDir: 'dist', // 输出目录为 dist
		rollupOptions: {
			external: [], // Specify external dependencies here
			output: {
				globals: {}, // Provide global variable names for external dependencies
			},
		},
	},
});
