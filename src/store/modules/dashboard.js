/* eslint-disable no-param-reassign */
import Vue from 'vue';
import c from '@/constants';
import { authedFetch } from '@/utils';

const LOAD_REPOS = 'LOAD_REPOS';
const LOAD_COGS = 'LOAD_COGS';
const LOAD_REPORTS = 'LOAD_REPORTS';
const LOAD_USERS = 'LOAD_USERS';
const SET_LOAD_START = 'SET_LOAD_START';
const SET_LOAD_END = 'SET_LOAD_END';
const SET_LOAD_FAIL = 'SET_LOAD_FAIL';
const REMOVE_REPO_START = 'REMOVE_REPO_START';
const REMOVE_REPO_END = 'REMOVE_REPO_END';
const REMOVE_REPO_FAIL = 'REMOVE_REPO_FAIL';
const HIDE_REPO_START = 'HIDE_REPO_START';
const HIDE_REPO_END = 'HIDE_REPO_END';
const HIDE_REPO_FAIL = 'HIDE_REPO_FAIL';
const APPROVE_REPO_START = 'APPROVE_REPO_START';
const APPROVE_REPO_END = 'APPROVE_REPO_END';
const APPROVE_REPO_FAIL = 'APPROVE_REPO_FAIL';

export default {
  namespaced: true,
  state: {
    repos: {
      loading: false,
      failed: false,
      error: null,
      list: [],
      fetched: 0,
    },
    cogs: {
      loading: false,
      failed: false,
      error: null,
      list: {},
      fetched: 0,
    },
    reports: {
      loading: false,
      failed: false,
      error: null,
      list: {},
      fetched: 0,
    },
    users: {
      loading: false,
      failed: false,
      error: null,
      list: [],
      fetched: 0,
    },
  },
  getters: {
    repos: state => state.repos.list,
    shouldFetchRepos: state =>
      state.repos.list.length === 0 ||
      state.repos.fetched === 0 ||
      Date.now() - state.repos.fetched > 3600000,
    cogs: state => state.cogs.list,
    reports: state => state.reports.list,
    users: state => state.users.list,
    isLoading: state => state.repos.loading || state.cogs.loading || state.reports.loading,
    isUsersLoading: state => state.users.loading,
  },
  mutations: {
    [LOAD_REPOS](state, payload) {
      state.repos.list.splice(0, state.repos.list.length);
      state.repos.list.push(...payload);
    },
    [LOAD_COGS](state, { path, cogData }) {
      Vue.set(state.cogs.list, path, cogData);
    },
    [LOAD_REPORTS](state, payload) {
      Object.entries(payload).forEach(([k, v]) => {
        Vue.set(state.reports.list, k, v);
      });
    },
    [LOAD_USERS](state, payload) {
      state.users.list.splice(0, state.users.list.length);
      state.users.list.push(...payload);
    },
    [SET_LOAD_START](state, payload) {
      state[payload.type].loading = true;
    },
    [SET_LOAD_END](state, payload) {
      state[payload.type].loading = false;
      state[payload.type].fetched = Date.now();
      state[payload.type].failed = false;
      state[payload.type].error = null;
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
    [HIDE_REPO_START](state, payload) {
      state[payload.type].loading = true;
    },
    [HIDE_REPO_END](state, payload) {
      state[payload.type].loading = false;
    },
    [HIDE_REPO_FAIL](state, payload) {
      state[payload.type].loading = false;
      state[payload.type].failed = true;
      state[payload.type].error = payload.error;
    },
    [APPROVE_REPO_START](state, payload) {
      state[payload.type].loading = true;
    },
    [APPROVE_REPO_END](state, payload) {
      state[payload.type].loading = false;
    },
    [APPROVE_REPO_FAIL](state, payload) {
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
        const resp = await fetch(`${c.REPOS}/${username}/?hidden=true&showUnapproved=true`);
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
    async loadAllRepos({ commit }) {
      const type = 'repos';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await fetch(`${c.REPOS}/?hidden=true&showUnapproved=true`);
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
    async loadReports({ commit, rootGetters }) {
      const type = 'reports';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.PANEL}/reports`, rootGetters);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);

        commit(LOAD_REPORTS, json.result);
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
    async hideRepo({ commit, rootGetters }, {
      username, repo, branch, hidden,
    }) {
      const type = 'repos';
      commit(HIDE_REPO_START, { type });
      console.log(hidden);
      try {
        const resp = await authedFetch(
          `${c.PANEL}/hideRepo/${username}/${repo}/${branch}`,
          rootGetters,
          'PUT',
          { hidden },
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);
        commit(HIDE_REPO_END, { type });
      } catch (e) {
        console.error(e);
        commit(HIDE_REPO_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async approveRepo(
      { commit, rootGetters },
      {
        authorName: username, name: repo, branch, type: state,
      },
    ) {
      const type = 'repos';
      commit(APPROVE_REPO_START, { type });
      try {
        const resp = await authedFetch(
          `${c.PANEL}/approve/${username}/${repo}/${branch}`,
          rootGetters,
          'POST',
          { approved: state === 'approved' ? 'unapproved' : 'approved' },
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);
        commit(APPROVE_REPO_END, { type });
      } catch (e) {
        console.error(e);
        commit(APPROVE_REPO_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async loadCogs({ commit }, path) {
      const type = 'cogs';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await fetch(`${c.COGS}/${path}?hidden=true&showUnapproved=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);

        commit(LOAD_COGS, { path, cogData: json.results });
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async loadUsers({ commit, rootGetters }) {
      const type = 'users';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.USERS}`, rootGetters);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);

        commit(LOAD_USERS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async updateUser({ commit, rootGetters }, { id, data }) {
      const type = 'users';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.USERS}/${id}`, rootGetters, 'PATCH', data);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) throw new Error(json.error || json.errorMessage);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
  },
};
