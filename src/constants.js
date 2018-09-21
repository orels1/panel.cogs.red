const API =
  process.env.NODE_ENV === 'development'
    ? 'http://cogs.eu.eu.ngrok.io/'
    : 'https://cogs.red/api/v1/';
const COGS = `${API}cogs`;
const REPOS = `${API}repos`;
const TAGS = `${API}misc/tags/top`;
const SEARCH = `${API}search/cogs`;
const GITHUB = `${API}github`;
const PARSER = `${API}parser`;

export default {
  API,
  COGS,
  REPOS,
  TAGS,
  SEARCH,
  GITHUB,
  PARSER,
};
