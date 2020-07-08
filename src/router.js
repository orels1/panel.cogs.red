import Vue from 'vue';
import Router from 'vue-router';
import store from './store';
import Home from './views/Home.vue';
import Auth from './views/Auth.vue';
import { authGuard } from './authGuard';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: { render: h => h('router-view') },
      children: [
        {
          path: '/',
          name: 'Home',
          component: Home,
        },
        {
          path: '/addRepo',
          name: 'Add Repo',
          beforeEnter: authGuard,
          component: () => import('./views/AddRepo.vue'),
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          beforeEnter: authGuard,
          component: () => import('./views/Dashboard.vue'),
        },
        {
          path: '/reportFeed',
          name: 'Report Feed',
          beforeEnter: authGuard,
          component: () => import('./views/ReportFeed.vue'),
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
