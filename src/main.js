import Vue from 'vue'
import VueMaterial from 'vue-material'
import VueRouter from 'vue-router'

import App from './App.vue'
import router from './routes'
import state from './state'

Vue.use(VueMaterial);
Vue.use(VueRouter);

new Vue({
  el: '#app',
  render: h => h(App),
  router: router
});
