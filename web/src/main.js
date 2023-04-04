import Vue from 'vue';
import App from './App.vue';
import router from './router';
import example from './utils/example/e.g.index';

example.activate();

Vue.config.productionTip = false;

/* eslint-disable no-new */
// @ts-ignore
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
});