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
const MARK_REPORT = 'MARK_REPORT';

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
      list: [],
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
    repos: state => state.repos.list.map(repo => ({
      ...repo,
      reports: state.reports.list.filter(i => (i.path.substr(0, i.path.lastIndexOf('/')) === repo.path)),
    })),
    shouldFetchRepos: state =>
      state.repos.list.length === 0 ||
      state.repos.fetched === 0 ||
      Date.now() - state.repos.fetched > 3600000,
    cogs: state => Object.entries(state.cogs.list).reduce((list, [repo, cogs]) => {
      list[repo] = cogs.map(cog => ({
        ...cog,
        reports: state.reports.list.filter(i => i.path === cog.path),
      }));
      return list;
    }, {}),
    reports: state => state.reports.list,
    users: state => state.users.list,
    isLoading: state =>
      state.repos.loading || state.cogs.loading || state.reports.loading,
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
      state.reports.list.splice(0, state.reports.list.length);
      state.reports.list.push(...payload);
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
    [MARK_REPORT](state, payload) {
      const reportIndex = state.reports.list.findIndex(i => i.id === payload.id);
      if (reportIndex === -1) return;
      Vue.set(state.reports.list, reportIndex, {
        ...state.reports.list[reportIndex],
        ...payload,
      });
    },
  },
  actions: {
    async loadRepos({ commit, rootState }) {
      const {
        main: {
          profile: { nickname: username },
        },
      } = rootState;
      const type = 'repos';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.REPOS}/${username}/?showHidden=true&showUnapproved=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

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
        const resp = await authedFetch(`${c.REPOS}/?showHidden=true&showUnapproved=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

        commit(LOAD_REPOS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async loadReports({ commit, rootState }, all = false) {
      const {
        main: {
          profile: { nickname: username },
        },
      } = rootState;
      const type = 'reports';
      commit(SET_LOAD_START, { type });
      try {
        const reqUrl = all ? c.REPORTS : `${c.REPORTS}/${username}`;
        const resp = await authedFetch(reqUrl);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

        commit(LOAD_REPORTS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async markReport({ commit }, { type: reportType, value, id }) {
      const type = 'reports';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(
          `${c.REPORTS}/${id}/${reportType}`,
          'POST',
          { [reportType]: value },
        );
        const json = await resp.json();
        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

        commit(MARK_REPORT, json);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async removeRepo({ commit }, { username, repo, branch }) {
      const type = 'repos';
      commit(REMOVE_REPO_START, { type });
      try {
        const resp = await authedFetch(
          `${c.PANEL}/${username}/${repo}/${branch}`,
          'DELETE',
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }
        commit(REMOVE_REPO_END, { type });
      } catch (e) {
        console.error(e);
        commit(REMOVE_REPO_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async hideRepo(
      { commit },
      {
        username, repo, branch, hidden,
      },
    ) {
      const type = 'repos';
      commit(HIDE_REPO_START, { type });
      try {
        const resp = await authedFetch(
          `${c.PANEL}/${username}/${repo}/${branch}/hide`,
          'PATCH',
          { hidden },
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }
        commit(HIDE_REPO_END, { type });
      } catch (e) {
        console.error(e);
        commit(HIDE_REPO_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async approveRepo(
      { commit },
      {
        authorName: username, name: repo, branch, type: state,
      },
    ) {
      const type = 'repos';
      commit(APPROVE_REPO_START, { type });
      try {
        const resp = await authedFetch(
          `${c.PANEL}/${username}/${repo}/${branch}/approve`,
          'PATCH',
          { approved: state === 'approved' ? 'unapproved' : 'approved' },
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }
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
        const resp = await authedFetch(`${c.COGS}/${path}?showHidden=true&showUnapproved=true`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

        commit(LOAD_COGS, { path, cogData: json.results });
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async loadUsers({ commit }) {
      const type = 'users';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(`${c.USERS}`);
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }

        commit(LOAD_USERS, json.results);
        commit(SET_LOAD_END, { type });
      } catch (e) {
        console.error(e);
        commit(SET_LOAD_FAIL, { type, error: e.message });
        return e.message;
      }
      return null;
    },
    async updateUser({ commit }, { id, data }) {
      const type = 'users';
      commit(SET_LOAD_START, { type });
      try {
        const resp = await authedFetch(
          `${c.USERS}/${id}/meta`,
          'PATCH',
          data,
        );
        const json = await resp.json();

        if (!resp.ok || json.errorMessage) { throw new Error(json.error || json.errorMessage); }
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
