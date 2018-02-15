import Vue from 'vue'
import Router from 'vue-router'
import InvoiceRecords from './InvoiceRecords.vue'
import Custominvoice from './Custominvoice.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'InvoiceRecords',
      component: InvoiceRecords
    },
    {
      path: '/custominvoice',
      name: 'Custominvoice',
      component: Custominvoice
    }
  ]
})
