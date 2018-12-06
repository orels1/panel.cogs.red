/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import camelCase from 'lodash/camelCase';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const requireModule = require.context('./modules', false, /\.js$/);
const modules = {};

requireModule.keys().forEach((fileName) => {
  const moduleName = camelCase(fileName.replace(/(\.\/|\.js)/g, ''));
  modules[moduleName] = requireModule(fileName).default;
});

const store = new Vuex.Store({
  modules: {
    ...modules,
  },
  plugins: [
    createPersistedState({
      paths: ['main', 'dashboard'],
    }),
  ],
});

export default store;
