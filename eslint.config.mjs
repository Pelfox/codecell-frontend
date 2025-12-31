import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  nextjs: true,
  typescript: true,
  formatters: true,
  stylistic: false,
  rules: {
    'no-console': 'off',
  },
});
