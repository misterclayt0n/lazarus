import { authKit } from '@workos/authkit-sveltekit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = (event) => authKit.signOut(event);
