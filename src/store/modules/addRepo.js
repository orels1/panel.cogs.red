/* eslint-disable no-param-reassign */
import c from '@/constants';

const LOAD_REPOS = 'LOAD_REPOS';
const LOAD_BRANCHES = 'LOAD_BRANCHES';
const SET_REPO = 'SET_REPO';
const SET_LOAD_START = 'SET_LOAD_START';
const SET_LOAD_END = 'SET_LOAD_END';
const SET_LOAD_FAIL = 'SET_LOAD_FAIL';
const VALIDATE = 'VALIDATE';
const SET_VALID = 'SET_VALID';

const authedFetch = (url, rootGetters) => {
  const { token } = rootGetters;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default {
  namespaced: true,
  state: {
    repos: {
      loading: false,
      failed: false,
      error: null,
      list: [],
    },
    branches: {
      loading: false,
      failed: false,
      error: null,
      list: [],
    },
    selected: {
      username: '',
      repo: '',
      branch: '',
    },
    validation: {
      passed: false,
      loading: false,
      results: {},
    },
  },
  mutations: {
    [LOAD_REPOS](state, payload) {
      state.repos.list = payload;
    },
    [LOAD_BRANCHES](state, payload) {
      state.branches.list = payload;
    },
    [SET_REPO](state, payload) {
      state.selected = {
        ...state.selected,
        ...payload,
      };
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
    [VALIDATE](state, payload) {
      state.validation.results = { ...payload };
    },
    [SET_VALID](state, payload) {
      state.validation.passed = payload;
    },
  },
  actions: {
    async fetchRepos({ commit, state, rootGetters }) {
      const {
        selected: { username },
      } = state;
      const type = 'repos';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.GITHUB}/repos/${username}`, rootGetters);
        const json = await resp.json();

        if (!resp.ok) throw new Error(json.error);

        commit(LOAD_REPOS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async fetchBranches({ commit, state, rootGetters }) {
      const {
        selected: { username, repo },
      } = state;
      const type = 'branches';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.GITHUB}/branches/${username}/${repo}`, rootGetters);
        const json = await resp.json();

        if (!resp.ok) throw new Error(json.error);

        commit(LOAD_BRANCHES, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
      }
    },
    setRepo({ commit }, data) {
      commit(SET_REPO, data);
    },
    async validate({ commit, state }) {
      const {
        selected: { username, repo, branch },
      } = state;
      const type = 'validation';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await fetch(`${c.PARSER}/v2/${username}/${repo}?branch=${branch}`);
        const json = await resp.json();

        if (!resp.ok) throw new Error(json.error);

        commit(VALIDATE, json);
        commit(SET_VALID, true);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_VALID, false);
        commit(SET_LOAD_FAIL, { type, error: e.message });
      }
      // add valid check
    },
  },
};
