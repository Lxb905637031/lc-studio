// 引入 ESLint 官方规则集
const eslint = require('@eslint/js')
// 引入全局变量定义
const globals = require('globals')
// 引入 React Hooks 规则插件
const reactHooks = require('eslint-plugin-react-hooks')
// 引入 React Refresh 规则插件
const reactRefresh = require('eslint-plugin-react-refresh')
// 引入 Prettier 集成插件
const eslintPrettier = require('eslint-plugin-prettier')
// 引入简单导入排序插件
const importSort = require('eslint-plugin-simple-import-sort')

// 引入 typescript-eslint 配置工具
const tseslint = require('typescript-eslint')

// 定义需要忽略的文件/目录列表
const ignores = [
  'dist', // 构建产物目录
  'build', // 构建目录
  '**/dist/**', // 所有 dist 子目录
  '**/build/**', // 所有 build 子目录
  '**/*.js', // 所有 JS 文件
  '**/*.mjs', // 所有 MJS 文件
  'eslint.config.js', // 自身配置文件
  'commitlint.config.js', // commitlint 配置文件
]

// 前端项目 ESLint 配置（针对 apps/webs 目录下的 ts/tsx 文件）
const fontEndConfig = {
  files: ['apps/frontend/**/*.{ts,tsx}'], // 匹配前端源码文件
  languageOptions: {
    ecmaVersion: 2020, // 使用 ES2020 语法
    globals: globals.browser, // 启用浏览器全局变量
  },
  plugins: {
    'react-hooks': reactHooks, // React Hooks 规则插件
    'react-refresh': reactRefresh, // React Refresh 规则插件
  },
  rules: {
    ...reactHooks.configs.recommended.rules, // 合并官方推荐规则
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }], // 限制仅导出组件
    'react-hooks/incompatible-library': ['warn', { libraryName: 'react' }], // 检测不兼容的库
    'react-hooks/static-components': ['warn', { libraryName: 'react' }], // 检测静态组件
    'no-console': 'error', // 禁止使用 console
  },
}

// 公共包 ESLint 配置（针对 packages 目录下的 ts/tsx 文件）
const packagesConfig = {
  files: ['packages/**/*.{ts,tsx}'], // 匹配公共包源码文件
  languageOptions: {
    globals: globals.node, // 启用 Node.js 全局变量
  },
  rules: {
    'no-console': 'error', // 禁止使用 console
  },
}

// 导出合并后的 ESLint 配置
module.exports = tseslint.config(
  {
    ignores, // 应用忽略列表
  },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended], // 继承 ESLint 与 TS 推荐规则
    plugins: {
      prettier: eslintPrettier, // Prettier 集成插件
      'simple-import-sort': importSort, // 简单导入排序插件
    },
    rules: {
      'prettier/prettier': ['error', { tabWidth: 2 }], // Prettier 使用 2 个空格缩进
      'simple-import-sort/imports': 'error', // 强制导入排序
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型
      '@typescript-eslint/no-unused-vars': 'off', // 允许未使用变量
      indent: ['error', 2, { SwitchCase: 1 }], // 缩进 2 个空格
    },
  },
  packagesConfig, // 合并公共包配置
  fontEndConfig // 合并前端配置
)
