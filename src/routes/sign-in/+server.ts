import { redirect } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const signInUrl = await authKit.getSignInUrl();
	throw redirect(302, signInUrl);
};
