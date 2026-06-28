// js/utils/api.js — tiny fetch wrapper for the backend API.
//
// Always sends the session cookie (credentials: 'include'), parses JSON, and
// throws a friendly Error on non-2xx or { ok:false } responses so callers can
// `try/catch` and surface a popup. Keep all API calls going through here.

async function request(method, url, body) {
  const opts = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch {
    const e = new Error('Could not reach the server. Please check your connection.');
    e.offline = true;
    throw e;
  }

  let data = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }

  if (!res.ok || (data && data.ok === false)) {
    const e = new Error((data && data.error) || `Request failed (${res.status}).`);
    e.status = res.status;
    e.data = data;
    throw e;
  }
  return data;
}

export const apiGet  = (url)        => request('GET', url);
export const apiPost = (url, body)  => request('POST', url, body ?? {});
