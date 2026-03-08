/** @type {import('prettier').Config} */
module.exports = {
    // 箭头函数参数只有一个时是否添加括号
    // "avoid" - 省略单参数括号 (x) => x => x => x
    arrowParens: 'avoid',

    // 文件换行符风格
    // "lf" - Unix 风格 (\n)
    // "crlf" - Windows 风格 (\r\n)
    // "auto" - 根据文件自动检测
    endOfLine: 'lf',

    // 代码最大宽度（超过则换行）
    printWidth: 140,

    // 语句末尾是否添加分号
    // true - 添加分号
    // false - 不添加分号
    semi: false,

    // 是否使用单引号
    // true - 使用单引号
    // false - 使用双引号
    singleQuote: true,

    // 制表符宽度（缩进空格数）
    tabWidth: 4,

    // 对象/数组末尾是否添加逗号
    // "es5" - ES5 兼容（对象尾逗号允许，数组尾逗号允许）
    // "always" - 总是添加尾逗号
    // "always-multiline" - 多行时添加尾逗号
    // "none" - 不添加尾逗号
    trailingComma: 'es5',
}
