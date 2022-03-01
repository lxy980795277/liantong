import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import vueParticles from 'vue-particles'
import 'element-ui/lib/theme-chalk/index.css';
import '../static/css/icon.css';
import './views/common/directives';

Vue.use(ElementUI);
Vue.use(vueParticles);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
