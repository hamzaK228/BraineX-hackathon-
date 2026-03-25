module.exports = {
    env: {
        node: true,
        es2021: true,
        browser: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'prettier',
    ],
    globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        BraineX: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'node/no-unsupported-features/es-syntax': ['error', {
            ignores: ['modules'],
        }],
        'node/no-missing-import': 'off',
        'node/no-unpublished-import': 'off',
    },
};
