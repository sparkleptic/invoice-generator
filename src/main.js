import Vue from 'vue'
import BootstrapVue from "bootstrap-vue"
import VueResource from "vue-resource"

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue);
Vue.use(VueResource);

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
