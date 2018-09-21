<template lang="pug">
  v-container(fluid)
    v-snackbar(
      :value="notification.shown"
      :color="notification.color"
      right
      bottom
      absolute
    ) {{notification.message}}
    v-slide-y-transition(mode="out-in")
      v-layout(column)
          v-stepper(v-model="stepIndex" vertical expand value="true")
            v-stepper-step(
              step="1"
              :editable="true"
              :complete="!!selected.username"
            )
              v-layout(row)
                div Get repos

            v-stepper-content(step="1")
              v-text-field(
                label="Username"
                :value="selected.username",
                @input="setUserName"
                @keydown.enter="loadRepos"
                readonly
              )
              v-btn(
                color="primary"
                @click="loadRepos"
                :loading="repos.loading"
                :disabled="!selected.username || repos.loading"
              ) Get Repos

            v-stepper-step(
              step="2"
              :editable="stepIndex > 2"
              :complete="!!selected.repo"
            )
              v-layout(row)
                div Select Repo
                div &nbsp;
                div(v-if="selected.repo && stepIndex > 2") ({{selected.repo}})

            v-stepper-content(step="2")
              v-autocomplete(
                @input="setRepoName"
                ref="repoSelector"
                :items="repos.list.map(r => ({ value: r.name, text: r.name }))"
                label="Repo"
                hint="Supports fuzzy search!"
                persistent-hint
                :value="selected.repo"
              )
              br
              v-btn(
                color="primary"
                @click="loadBranches"
                :loading="branches.loading"
                :disabled="!selected.repo || branches.loading"
              ) Load Branches
              v-btn(@click="prevStep") Go Back

            v-stepper-step(
              step="3"
              :editable="stepIndex > 3"
              :complete="!!selected.branch"
            )
              |Select Branch

            v-stepper-content(step="3")
              v-autocomplete(
                @change="setBranchName"
                ref="branchSelector"
                :items="branches.list.map(r => ({ value: r.name, text: r.name }))"
                label="Branch"
                hint="Supports fuzzy search!"
                persistent-hint
                :value="selected.branch"
              )
              br
              v-btn(
                color="success"
                @click="loadValidation"
                :loading="validation.loading"
                :disabled="!selected.branch || validation.loading"
              )
                v-icon check
                div &nbsp;
                div Validate!
              v-btn(@click="prevStep") Go Back

            v-stepper-step(step="4" :complete="validationSuccess")
              |Validation

            v-stepper-content(step="4")
              v-alert(
                value="validationSuccess"
                color="success"
                icon="check_circle"
                outline
              ) Repo successfully validated!
              v-list(two-line v-if="validationSuccess")
                v-list-tile
                  v-list-tile-content
                    v-list-tile-title Repo Info
                    v-list-tile-sub-title.
                      {{validation.results.repo.name}} by {{validation.results.repo.author.name}}
                v-list-tile
                  v-list-tile-content
                    v-list-tile-title Valid Cogs
                    v-list-tile-sub-title {{validation.results.cogs.valid.length}}


</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapState, mapGetters, mapActions } from 'vuex';

@Component({
  computed: {
    ...mapState('addRepo', {
      selected: state => state.selected,
      validation: state => state.validation,
      repos: state => state.repos,
      branches: state => state.branches,
    }),
    ...mapGetters(['profile', 'notification']),
  },
  methods: {
    ...mapActions('addRepo', ['setRepo', 'fetchRepos', 'fetchBranches', 'validate']),
    ...mapActions(['notify']),
  },
})
export default class AddRepo extends Vue {
  stepIndex = 1;

  mounted() {
    this.setUserName(this.profile.name);
  }

  nextStep() {
    this.stepIndex = this.stepIndex + 1;
  }

  prevStep() {
    this.stepIndex = this.stepIndex - 1;
  }

  firstStep() {
    this.stepIndex = 1;
  }

  setUserName(username = '') {
    this.setRepo({ username });
  }

  setRepoName(repo = '') {
    // change to default branch if we're chaning repos
    const branch = this.repos.list.find(r => r.name === repo).default_branch;
    this.setRepo({ repo, branch });
    this.$refs.repoSelector.blur();
  }
  setBranchName(branch = '') {
    this.setRepo({ branch });
    this.$refs.branchSelector.blur();
  }

  async loadRepos() {
    const err = await this.fetchRepos();
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    if (!this.stepIndex > 1) {
      this.nextStep();
    } else {
      this.stepIndex = 2;
    }
    return null;
  }

  async loadBranches() {
    await this.fetchBranches();
    if (!this.stepIndex > 2) {
      this.nextStep();
    } else {
      this.stepIndex = 3;
    }
  }

  async loadValidation() {
    await this.validate();
    this.nextStep();
  }

  get defaultBranch() {
    if (!this.selected.repo) return null;
    return this.repos.list.find(r => r.name === this.selected.repo).default_branch;
  }

  get branchWarning() {
    if (!this.selected.branch) return null;
    return this.selected.branch === '___'
      ? 'Cogs.red does not allow a non-default branch to be called ___'
      : null;
  }

  get canCreateHook() {
    return !!this.selected.branch && !!this.selected.repo && !!this.selected.username;
  }

  get validationSuccess() {
    return !!Object.keys(this.validation.results).length && !this.validation.loading;
  }

  async createHook() {
    const resp = await fetch(
      `http://localhost:3000/github/hooks/${this.username}/${this.selectedRepo}`,
      {
        method: 'POST',
      },
    );
    const json = await resp.json();
    if (json.results.active) this.creationResult = `hook created at ${json.results.config.url}`;
  }
}
</script>

<style scoped>
</style>
