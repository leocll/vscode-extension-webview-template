const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    configureWebpack: (config) => {
        Object.assign(config, {
            resolve: {
                alias: {
                    vue$: "vue/dist/vue.esm.js", // vue导入项
                    '@': path.resolve(__dirname, 'src'),
                    '@c': path.resolve(__dirname, 'src', 'components'),
                },
                fallback: {
                    "events": require.resolve("events/"),
                }
            }
        });
    },
});
