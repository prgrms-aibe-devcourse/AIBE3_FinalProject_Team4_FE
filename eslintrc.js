module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended', // Prettier와 충돌 방지 + 자동 포맷
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect', // React 버전 자동 감지
    },
  },
  rules: {
    'prettier/prettier': 'error', // Prettier 규칙 위반 시 ESLint 에러로 표시
    'react/react-in-jsx-scope': 'off', // Next.js에서는 필요 없음
    'no-unused-vars': 'warn', // 사용 안 하는 변수 경고
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external', 'internal']],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};
