<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout(column)
        v-card
          v-card-title.headline.grey(:class="[darkTheme ? 'darken-4' : 'lighten-2']") Add a repo to cogs.red
          v-card-text.
            Want to share your shiny new repository full of awesome cogs with all of the
             Red - Discord Bot community? This is the place to go!
             #[br]
             Follow these steps and your repo should be up in notime.
        v-stepper(v-model="stepIndex" vertical expand value="true")
          v-stepper-step(
            step="1"
            :editable="true"
            :complete="!!selected.username"
          )
            v-layout(row)
              div Get Repos

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
            |Validate Your Repo

          v-stepper-content(step="4")
            v-alert(
              :value="validationSuccess"
              :color="validationAlert.color"
              :icon="validationAlert.icon"
              outline
            ) {{validationAlert.text}}
            v-expansion-panel(v-if="validation.results.errors" expand)
              v-expansion-panel-content(
                v-for="(error, i) in validation.results.errors"
                :key="i"
              )
                div(slot="header") {{error.message}} in #[kbd {{error.path}}]
                v-card(v-if="error.details")
                  v-card-text
                    pre
                      code.wide {{error.details}}
            p(v-if="!canSubmit").
              #[br]
              Your repo has errors that prevent it from being added to cogs.red,
                they are listed above.
              #[br]
              Please fix them and use "Go Back" button to go back a step
                and re-validate your repo or to choose another branch.

            v-dialog(
              v-model="submitDialog"
              max-width="600"
            )
              v-btn(
                slot="activator"
                color="primary"
                :loading="creation.loading"
                :disabled="!canSubmit || creation.loading"
              ) Submit Repository
              v-card
                v-card-title.headline.grey.darken-2(primaryTitle)
                  |You are about to submit your repo
                v-card-text.
                  Proceeding to next step will create a new webhook on your repository
                    that will be used to automatically update your repo on cogs.red.
                  #[br]#[br]
                  #[b You will be submitting:]#[br]
                  Repo called #[code {{selected.repo}}]
                    by #[code {{selected.username}}]
                    on branch #[code {{selected.branch}}]
                  #[br]#[br]
                  After submitting your repo - it will become immediately available as an
                    unapproved repository, and Red - Discord Bot QA team will be notified.
                  #[br]#[br]
                  Are you sure you want to proceed?
                v-divider
                v-card-actions
                  v-spacer
                  v-btn(
                    flat
                    @click="submitDialog = false"
                  ) No, abort
                  v-btn(
                    color="primary"
                    flat
                    @click="createNewRepo"
                  ) Yes, submit
            v-btn(@click="prevStep") Go Back

          v-stepper-step(step="5" :complete="!!creation.result")
            |Submit it!

          v-stepper-content(step="5")
            v-alert(
              :value="true"
              color="success"
              icon="check_circle"
              outline
            ) {{creation.result}}


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
      creation: state => state.creation,
    }),
    ...mapGetters(['darkTheme', 'profile']),
  },
  methods: {
    ...mapActions('addRepo', ['setRepo', 'fetchRepos', 'fetchBranches', 'validate', 'createRepo']),
    ...mapActions(['notify']),
  },
})
export default class AddRepo extends Vue {
  stepIndex = 1;
  submitDialog = false;

  mounted() {
    this.setUserName(this.profile.nickname);
  }

  nextStep() {
    this.stepIndex = parseInt(this.stepIndex, 10) + 1;
  }

  prevStep() {
    this.stepIndex = parseInt(this.stepIndex, 10) - 1;
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
    const err = await this.fetchBranches();
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    if (!this.stepIndex > 2) {
      this.nextStep();
    } else {
      this.stepIndex = 3;
    }
    return null;
  }

  async loadValidation() {
    const err = await this.validate();
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    this.nextStep();
    return null;
  }

  async createNewRepo() {
    this.submitDialog = false;
    const err = await this.createRepo();
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    this.nextStep();
    return null;
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

  get validationSuccess() {
    return !!Object.keys(this.validation.results).length && !this.validation.loading;
  }

  get validationAlert() {
    if (
      this.validation.passed &&
      this.validation.results.errors.filter(i => i.level === 'error').length
    ) {
      return ({
        color: 'warning',
        icon: 'warning',
        text: 'There were some errors during validation',
      });
    }
    if (!this.validation.passed) {
      return ({
        color: 'error',
        icon: 'error',
        text: 'Validation did not pass',
      });
    }
    return ({
      color: 'success',
      icon: 'check_circle',
      text: 'Repo successfully validated',
    });
  }

  get canSubmit() {
    return this.validationSuccess && this.validationAlert.color !== 'error';
  }
}
</script>

<style scoped>
.wide {
  width: 100%;
}
</style>
