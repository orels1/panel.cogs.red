/* eslint-disable import/prefer-default-export */
import { getInstance } from './plugins/auth0';

export const authedFetch = async (url, method = 'GET', body) => {
  const authService = getInstance();
  const token = await authService.getTokenSilently();
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    method,
    body: body && JSON.stringify(body),
  });
};
