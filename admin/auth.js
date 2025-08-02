import jwt_decode from "jwt-decode";

const AUTH_TOKEN_KEY = 'authToken';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function decodeToken(token) {
  try {
    return jwt_decode(token);
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}