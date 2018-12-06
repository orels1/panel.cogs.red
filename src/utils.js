export const authedFetch = (url, rootGetters, method = 'GET', body) => {
  const { token } = rootGetters;
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: body && JSON.stringify(body),
  });
};
