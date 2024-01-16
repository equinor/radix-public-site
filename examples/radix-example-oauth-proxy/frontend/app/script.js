function fetchApi() {
  return fetch(document.location.origin + '/api/', { redirect: 'error' })
    .then(handleApiResponse)
    .catch(handleApiError);
}

function handleApiResponse(res) {
  return res.text().then(body => {
    let output = `
      Response to request for /api/
      =============================
      Status
      ------
      ${res.status} ${res.statusText}
      
      Headers
      -------
      ${JSON.stringify(Array.from(res.headers.entries(), h => `${h[0]}: ${h[1]}`), null, 2)}

      Body
      ----
      ${body}
    `;
    document.getElementById('responseOutput').innerText = output;
  });
}

function handleApiError() {
    // This is a good place to check if the request failed due to
    // authentication issues and try to re-authenticate

    return fetch(document.location.origin + '/oauth2/auth')
      .then(res => {
        if (res.status === 401) {
          if (window.confirm('You are not logged in; reload page now to authenticate?')) {
            window.location.reload();
          }
        } else {
          console.error('Weird!', res);
        }
      });
}

// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('triggerFetch');
  btn.addEventListener('click', fetchApi)
});