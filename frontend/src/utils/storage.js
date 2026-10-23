// Browser storage for the login session.
//
// We use sessionStorage: it is cleared when the browser tab is closed.
//
// SECURITY LIMITATIONS (please read):
// - Any JavaScript running on this page can read sessionStorage. If an attacker
//   ever manages to inject a script (an XSS attack), they could steal the token.
//   React escapes text by default and this project never uses
//   dangerouslySetInnerHTML, which reduces that risk, but it cannot remove it.
// - A more secure design is for the backend to set the JWT in an httpOnly,
//   Secure, SameSite cookie, which JavaScript cannot read. That needs backend
//   changes, so it is not done here.
// - Values in browser storage can be edited by the user in DevTools. So the
//   stored "role" is only used to choose which screens to show. The backend
//   must verify the JWT and the role on every protected request.
// - Passwords are never stored. Tokens are never logged.

const TOKEN_KEY = 'aplus_plane_token';
const STUDENT_KEY = 'aplus_plane_student';

function getStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null; // Storage can be blocked by browser privacy settings.
  }
}

export function getToken() {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function loadSession() {
  const storage = getStorage();
  if (!storage) return { token: null, student: null };
  try {
    const token = storage.getItem(TOKEN_KEY);
    const rawStudent = storage.getItem(STUDENT_KEY);
    return {
      token,
      student: rawStudent ? JSON.parse(rawStudent) : null,
    };
  } catch {
    return { token: null, student: null };
  }
}

export function saveSession(token, student) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(STUDENT_KEY, JSON.stringify(student));
  } catch {
    // Ignore storage errors (for example, storage is full or blocked).
  }
}

export function clearSession() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(STUDENT_KEY);
  } catch {
    // Ignore storage errors.
  }
}