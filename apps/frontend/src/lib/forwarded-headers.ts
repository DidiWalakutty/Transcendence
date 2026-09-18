import { getRequestHeader } from '@tanstack/react-start/server';

// Headers a server-side call to the backend carries on behalf of the visitor.
//
// The cookie identifies the visitor's session. X-Forwarded-For is the
// visitor's address as Caddy set it: the backend rate-limits by that address,
// and a call without it is counted against a bucket every visitor shares,
// which fills up as soon as a few people browse at once (BS-13).
export function getForwardedRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = getRequestHeader('cookie');
  const forwardedFor = getRequestHeader('x-forwarded-for');

  if (cookie) headers.cookie = cookie;
  if (forwardedFor) headers['x-forwarded-for'] = forwardedFor;

  return headers;
}
