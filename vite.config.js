import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	build: {
		outDir: './build'
	},
	resolve: {
		alias: {
			'loggie': path.resolve(__dirname, './loggie/src')
		},
	},
	plugins: [],
	server: { host: '0.0.0.0', port: 8001, open: './public/index.html' },
	clearScreen: false
})
