/* eslint-disable no-param-reassign */
import Vue from 'vue';
import { authedFetch } from '@/utils';
import c from '@/constants';

const THEME_SWITCH = 'THEME_SWITCH';
const LOGIN = 'LOGIN';
const AUTHENTICATE = 'AUTHENTICATE';
const LOGOUT = 'LOGOUT';
const DEAUTH = 'DEAUTH';
const SET_PROFILE = 'SET_PROFILE';
const CLEAR_PROFILE = 'CLEAR_PROFILE';
const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
const SET_USER_META = 'SET_USER_META';
const CLEAR_USER_META = 'CLEAR_USER_META';

export default {
  state: {
    darkTheme: false,
    authenticated: false,
    profile: {},
    meta: {
      admin: false,
      roles: [],
    },
    notification: {
      shown: false,
      color: undefined,
      message: '',
    },
  },
  getters: {
    darkTheme: state => state.darkTheme,
    authenticated: state => state.authenticated,
    profile: state => state.profile,
    meta: state => state.meta,
    isAdmin: state => (state.meta ? !!state.meta.admin : false),
    isQA: state => (state.meta ? state.meta.roles && state.meta.roles.includes('qa') : false),
    notification: state => state.notification,
  },
  mutations: {
    [THEME_SWITCH]: (state, payload) => {
      state.darkTheme = payload;
    },
    [LOGIN]: (state, { token, expire }) => {
      state.token = token;
      state.expire = expire;
    },
    [AUTHENTICATE]: (state) => {
      state.authenticated = true;
    },
    [SET_PROFILE]: (state, payload) => {
      Object.entries(payload).forEach(([key, value]) => {
        Vue.set(state.profile, key, value);
      });
    },
    [LOGOUT]: (state) => {
      state.token = null;
      state.expire = 0;
    },
    [DEAUTH]: (state) => {
      state.authenticated = false;
    },
    [CLEAR_PROFILE]: (state) => {
      state.profile = {};
      state.meta = {
        admin: false,
        roles: [],
      };
    },
    [SHOW_NOTIFICATION]: (state, { color, message }) => {
      state.notification.color = color || undefined;
      state.notification.message = message;
      state.notification.shown = true;
    },
    [HIDE_NOTIFICATION]: (state) => {
      state.notification.shown = false;
      state.notification.message = '';
    },
    [SET_USER_META]: (state, payload) => {
      state.meta = { ...state.meta, ...payload };
    },
    [CLEAR_USER_META]: (state) => {
      state.meta = {};
    },
  },
  actions: {
    setDarkTheme({ commit }, type) {
      commit(THEME_SWITCH, type);
    },
    login({ commit }, token) {
      commit(LOGIN, token);
    },
    logout({ commit }) {
      commit(LOGOUT);
      commit(DEAUTH);
      commit(CLEAR_PROFILE);
    },
    setProfile({ commit }, { nickname, picture, name }) {
      commit(SET_PROFILE, { nickname, picture, name });
    },
    authenticate({ commit }) {
      commit(AUTHENTICATE);
    },
    async getUserMeta({ commit }) {
      try {
        const resp = await authedFetch(`${c.USERS}/current/meta`);
        const json = await resp.json();

        if (!resp.ok) throw new Error(json.error);
        commit(SET_USER_META, json);
      } catch (e) {
        console.error(e);
        return e.message;
      }
      return null;
    },
    clearUser({ commit }) {
      commit(CLEAR_PROFILE);
      commit(CLEAR_USER_META);
    },
    notify: {
      root: true,
      handler({ commit }, { color, message }) {
        commit(SHOW_NOTIFICATION, { color, message });
        setTimeout(() => {
          commit(HIDE_NOTIFICATION);
        }, 6000);
      },
    },
  },
};
