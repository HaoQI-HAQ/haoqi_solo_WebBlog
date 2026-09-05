import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        work: 'work.html',
        photography: 'photography.html',
        music: 'music.html',
        contact: 'contact.html',
      },
    },
  },
});
