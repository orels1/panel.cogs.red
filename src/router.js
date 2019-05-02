import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import Home from './views/Home.vue';
import Auth from './views/Auth.vue';

Vue.use(Router);

const checkAuth = async (to, from, next) => {
  const { expire, token, meta } = store.getters;
  if (!token) return next();
  if (Date.now() < expire) {
    if (!meta.roles.length) {
      await store.dispatch('getUserMeta');
    }
    return next();
  }
  return store.getters.lock.checkSession({}, async (err, authResult) => {
    if (err) {
      console.log(err);
      store.dispatch('notify', {
        color: 'error',
        message: 'Authorization expired, redirecting to auth page.',
      });
      store.dispatch('logout');
      store.dispatch('setLoginFail', true);
      store.dispatch('clearUser');
      return next({ name: 'Auth' });
    }
    const expireMs = authResult.expiresIn * 1000;
    store.dispatch('login', { token: authResult.idToken, expire: Date.now() + expireMs });
    await store.dispatch('getUserMeta');
    store.dispatch('setLoginFail', false);
    return next();
  });
};

const requireAuth = (to, from, next) => {
  const { token } = store.getters;
  if (!token) return next('/auth');
  return next();
};

const router = new Router({
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
          name: 'Home',
          component: Home,
        },
        {
          path: '/addRepo',
          name: 'Add Repo',
          beforeEnter: requireAuth,
          component: () => import('./views/AddRepo.vue'),
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          beforeEnter: requireAuth,
          component: () => import('./views/Dashboard.vue'),
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

router.beforeEach((to, from, next) => {
  document.title = (to.meta && to.meta.title && to.meta.title(to)) || `${to.name} | panel.cogs.red`;
  next();
});

export default router;
