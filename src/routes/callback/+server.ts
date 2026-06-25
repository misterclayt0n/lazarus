import { authKit } from '@workos/authkit-sveltekit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => authKit.handleCallback()(event);
