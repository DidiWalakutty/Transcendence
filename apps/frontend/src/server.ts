import { paraglideMiddleware } from './@generated/paraglide/server.js';
import handler from '@tanstack/react-start/server-entry';

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
