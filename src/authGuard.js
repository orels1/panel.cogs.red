/* eslint-disable import/prefer-default-export */
import { getInstance } from './plugins/auth0';

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    if (authService.isAuthenticated) {
      return (next());
    }

    if (authService.auth0Client) {
      authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
    }
  };

  if (!authService.loading) {
    return fn();
  }

  authService.$watch('loading', (loading) => {
    if (loading === false) {
      return fn();
    }
  });
};
