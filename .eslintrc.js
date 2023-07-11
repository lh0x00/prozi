module.exports = {
  extends: [
    'standard-with-typescript',
    'plugin:typescript-sort-keys/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'import',
    'sort-destructure-keys',
    'simple-import-sort',
    'typescript-sort-keys',
  ],
  rules: {
    'no-extra-semi': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'object-property-newline': 'error',
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 1,
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 1,
        },
        ImportDeclaration: {
          multiline: true,
          minProperties: 1,
        },
        ExportDeclaration: {
          multiline: true,
          minProperties: 1,
        },
      },
    ],
    semi: ['error', 'never'],
    'prettier/prettier': 'off',
    'spaced-comment': ['error', 'always'],
    'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    'array-element-newline': ['error', 'consistent'],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    'no-tabs': [
      'error',
      {
        allowIndentationTabs: true,
      },
    ],
    indent: ['error', 2],
    // Optional chaining when accessing prototype
    // method inside useCallback and useMemo
    // https://github.com/facebook/react/pull/19062
    'max-len': [
      'error',
      {
        code: 80,
        tabWidth: 2,
        ignoreUrls: false,
        ignoreStrings: true,
        ignoreTrailingComments: false,
        ignoreComments: false,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'function-call-argument-newline': ['error', 'consistent'],
    'function-paren-newline': ['error', 'consistent'],
    'array-bracket-newline': ['error', 'consistent'],
    'arrow-body-style': ['error', 'as-needed'],
    'no-duplicate-imports': 'error',
    'newline-before-return': 'warn',
    'prefer-const': 'warn',
    'prefer-arrow-callback': [
      'error',
      {
        allowNamedFunctions: true,
        allowUnboundThis: true,
      },
    ],
    'sort-destructure-keys/sort-destructure-keys': [
      'error',
      {
        caseSensitive: true,
      },
    ],
    'sort-imports': 'off',
    'import/order': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],
          // Packages. `react` related packages come first.
          ['^react', '^\\w', '^@?\\w'],
          // Internal packages.
          [],
          //
          [
            '^@!.+/internals$',
            '^@!.+/types$',
            '^@!.+/variables$',
            '^@!.+/settings?$',
            '^@!.+/shared$',
          ],
          // Local import
          ['^@/.*|$'],
          //
          ['^.+/shared', '^.+/models', '^.+/migrations'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.s?css$'],
        ],
      },
    ],
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
}
