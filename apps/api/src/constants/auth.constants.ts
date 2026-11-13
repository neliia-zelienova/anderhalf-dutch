export const SESSION_TTL = 60 * 60 * 24 * 30; // one month, in seconds
export const MAGIC_LINK_TTL = 15 * 60; // fifteen minutes, in seconds
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as 'lax' | 'strict' | 'none',
};
export const SESSION_TOUCH_INTERVAL = 60 * 60 * 1000; // one hour in milliseconds
