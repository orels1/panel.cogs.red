import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import Home from './views/Home.vue';
import Auth from './views/Auth.vue';

Vue.use(Router);

const checkAuth = (to, from, next) => {
  const { expire, token } = store.getters;
  if (!token) return next();
  if (Date.now() < expire) return next();
  return store.getters.lock.checkSession({}, (err, authResult) => {
    if (err) {
      console.log(err);
      store.dispatch('notify', {
        color: 'error',
        message: 'Authorization expired, redirecting to auth page.',
      });
      setTimeout(() => next({ name: 'Auth' }), 3000);
    } else {
      const expireMs = authResult.expiresIn * 1000;
      store.dispatch('login', { token: authResult.idToken, expire: Date.now() + expireMs });
      next();
    }
  });
};

const requireAuth = (to, from, next) => {
  const { token } = store.getters;
  if (!token) return next({ name: 'Auth' });
  return next();
};

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: { render: h => h('router-view') },
      beforeEnter: checkAuth,
      children: [
        {
          path: '/',
          name: 'home',
          component: Home,
        },
        {
          path: '/addRepo',
          name: 'Add Repo',
          beforeEnter: requireAuth,
          component: () => import('./views/AddRepo.vue'),
        },
        {
          path: '/auth',
          name: 'Auth',
          component: Auth,
        },
      ],
    },
  ],
});
