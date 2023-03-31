// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
		node: true,
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // required to lint *.vue files
    plugins: [
        'vue',
        'js'
    ],
    // add your custom rules here
    rules: {
        semi: ["error", "always"],
        indent: ["error", 4],
        quotes: 0,
        'eol-last': 0,
        'no-multi-spaces': 0,
        'space-infix-ops': 0,
        'promise/param-names': 0,
        'space-before-function-paren': ['error', 'never'],
        // allow async-await
        'generator-star-spacing': 'off',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-trailing-spaces': 'warn',
        'spaced-comment': 0,
    }
}