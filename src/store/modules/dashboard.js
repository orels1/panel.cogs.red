/* eslint-disable no-param-reassign */
import c from '@/constants';
import { authedFetch } from '@/utils';

const LOAD_REPOS = 'LOAD_REPOS';
const SET_LOAD_START = 'SET_LOAD_START';
const SET_LOAD_END = 'SET_LOAD_END';
const SET_LOAD_FAIL = 'SET_LOAD_FAIL';
const REMOVE_REPO_START = 'REMOVE_REPO_START';
const REMOVE_REPO_END = 'REMOVE_REPO_END';
const REMOVE_REPO_FAIL = 'REMOVE_REPO_FAIL';

export default {
  namespaced: true,
  state: {
    repos: {
      loading: false,
      failed: false,
      error: null,
      list: [],
    },
  },
  getters: {
    repos: state => state.repos.list,
  },
  mutations: {
    [LOAD_REPOS](state, payload) {
      state.repos.list.splice(0, state.repos.list.length);
      state.repos.list.push(...payload);
    },
    [SET_LOAD_START](state, payload) {
      state[payload.type].loading = true;
    },
    [SET_LOAD_END](state, payload) {
      state[payload.type].loading = false;
    },
    [SET_LOAD_FAIL](state, payload) {
      state[payload.type].loading = false;
      state[payload.type].failed = true;
      state[payload.type].error = payload.error;
    },
    [REMOVE_REPO_START](state, payload) {
      state[payload.type].loading = true;
    },
    [REMOVE_REPO_END](state, payload) {
      state[payload.type].loading = false;
    },
    [REMOVE_REPO_FAIL](state, payload) {
      state[payload.type].loading = false;
      state[payload.type].failed = true;
      state[payload.type].error = payload.error;
    },
  },
  actions: {
    async loadRepos({ commit, rootState }) {
      const {
        main: {
          profile: { name: username },
        },
      } = rootState;
      const type = 'repos';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await fetch(`${c.REPOS}/${username}/?hidden=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);

        commit(LOAD_REPOS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async loadAllrepos({ commit }) {
      const type = 'repos';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await fetch(`${c.REPOS}/?hidden=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);

        commit(LOAD_REPOS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async removeRepo({ commit, rootGetters }, { username, repo, branch }) {
      const type = 'repos';
      commit(REMOVE_REPO_START, { type });
      try {
        const resp = await authedFetch(
          `${c.PANEL}/removeRepo/${username}/${repo}/${branch}`,
          rootGetters,
          'DELETE',
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);
        commit(REMOVE_REPO_END, { type });
      } catch (e) {
        console.error(e);
        commit(REMOVE_REPO_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
  },
};
