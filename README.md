# lc-studio

## 依赖包说明

### TypeScript 工具链

-   **typescript** (5.6.3): TypeScript 编译器，提供类型检查和 JavaScript 编译功能
-   **@types/node** (22.9.0): Node.js 类型定义文件

### 构建工具

-   **tsup** (8.3.5): TypeScript 打包工具，用于将 TypeScript 代码打包成库

### 代码质量工具

-   **eslint** (9.14.0): JavaScript/TypeScript 代码检查工具
-   **@eslint/js** (9.14.0): ESLint 的 JavaScript 实现
-   **globals** (15.12.0): 全局变量定义列表
-   **typescript-eslint** (8.13.0): TypeScript 专用的 ESLint 规则

### React 相关 ESLint 插件

-   **eslint-plugin-react-refresh** (0.4.14): 检查 React 组件热更新相关的错误
-   **eslint-plugin-react-hooks** (^5.1.0-rc.0): React Hooks 规则检查

### 代码格式化与排序

-   **prettier** (3.3.3): 代码格式化工具
-   **eslint-plugin-prettier** (5.2.1): 将 Prettier 作为 ESLint 规则运行
-   **eslint-plugin-simple-import-sort** (12.1.1): 自动排序 import 语句

### 拼写检查

-   **cspell** (8.15.7): 代码拼写检查工具

### 代码提交规范

-   **husky** (9.1.6): Git 钩子管理工具，用于在 git 提交前自动运行代码检查
-   **lint-staged** (15.2.10): 只检查暂存区的文件，对不同类型的文件应用不同的格式化规则
-   **@commitlint/cli** (19.5.0): Commit message 格式检查 CLI
-   **@commitlint/config-conventional** (19.5.0): conventional commit 格式配置
-   **commitizen** (4.3.1): Commit message 格式化工具
-   **cz-git** (1.10.1): Git commit message 中文化支持

#### lint-staged 配置说明

`lint-staged` 会对不同类型的文件应用相应的处理规则：

-   **Markdown 和 JSON 文件** (`*.md,json`): 使用 Prettier 格式化
-   **CSS 和 Less 文件** (`*.css,less`): 使用 Prettier 格式化
-   **JavaScript 和 JSX 文件** (`*.js,jsx`): 先用 ESLint 修复，再用 Prettier 格式化
-   **TypeScript 和 TSX 文件** (`*.ts,tsx`): 先用 ESLint 修复，再用 Prettier 格式化（使用 TypeScript 解析器）

#### commitizen + cz-git 配置说明

`commitizen` 配合 `cz-git` 提供交互式的 commit message 输入界面：

-   支持中文 commit message
-   提供 emoji 图标选择（feat、fix、docs、style、refactor、perf、test、build、ci、chore、revert）
-   自动校验 scope 范围（必须在预定义的 packages/apps/docs 等范围内）
-   支持 breaking changes、issue 关联等高级功能

使用方式：`npx cz` 或 `npm run commit`

#### package.json 配置说明

**config.commitizen**: 指定 commitizen 使用的 adapter

```json
"config": {
    "commitizen": {
        "path": "node_modules/cz-git"
    }
}
```

该配置告诉 commitizen 使用 `cz-git` 作为提交消息的交互式引导工具。

**lint-staged**: 对暂存区的文件应用不同的代码处理规则

```json
"lint-staged": {
    "*.{md,json}": [
        "prettier --cache --write --no-error-on-unmatched-pattern"
    ],
    "*.{css,less}": [
        "prettier --cache --write"
    ],
    "*.{js,jsx}": [
        "eslint --fix",
        "prettier --cache --write"
    ],
    "*.{ts,tsx}": [
        "eslint --fix",
        "prettier --cache --parser=typescript --write"
    ]
}
```

-   `*.md,json`: Markdown 和 JSON 文件只使用 Prettier 格式化
-   `*.css,less`: CSS 和 Less 文件使用 Prettier 格式化
-   `*.js,jsx`: JavaScript 和 JSX 文件先用 ESLint 自动修复，再用 Prettier 格式化
-   `*.ts,tsx`: TypeScript 和 TSX 文件先用 ESLint 自动修复，再用 Prettier 格式化（使用 TypeScript 解析器）

该配置确保在代码提交前自动格式化和检查代码，保证代码质量。

### 其他工具

-   **fast-glob** (3.3.2): 高性能文件匹配工具
