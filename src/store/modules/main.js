/* eslint-disable no-param-reassign */
import Vue from 'vue';

const THEME_SWITCH = 'THEME_SWITCH';
const LOGIN = 'LOGIN';
const AUTHENTICATE = 'AUTHENTICATE';
const LOGOUT = 'LOGOUT';
const DEAUTH = 'DEAUTH';
const SET_PROFILE = 'SET_PROFILE';
const CLEAR_PROFILE = 'CLEAR_PROFILE';
const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';

export default {
  state: {
    darkTheme: false,
    token: null,
    expire: 0,
    authenticated: false,
    profile: {},
    notification: {
      shown: false,
      color: undefined,
      message: '',
    },
  },
  getters: {
    darkTheme: state => state.darkTheme,
    token: state => state.token,
    expire: state => state.expire,
    authenticated: state => state.authenticated,
    profile: state => state.profile,
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
    },
    [DEAUTH]: (state) => {
      state.authenticated = false;
    },
    [CLEAR_PROFILE]: (state) => {
      state.profile = {};
    },
    [SHOW_NOTIFICATION]: (state, { color, message }) => {
      state.notification.color = color || undefined;
      state.notification.message = message;
      state.notification.shown = true;
    },
    [HIDE_NOTIFICATION]: (state) => {
      state.notification.shown = false;
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
