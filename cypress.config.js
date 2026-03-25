import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: ['cypress/e2e/**/*.cy.js', 'frontend/cypress/e2e/**/*.cy.js'],
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  component: {
    devServer: {
      framework: 'vanilla',
      bundler: 'vite',
    },
  },
});
