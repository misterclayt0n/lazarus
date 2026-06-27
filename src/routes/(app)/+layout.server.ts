import { redirect } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';
import type { SessionUser } from '$lib/auth';

export const load = async (event) => {
	const user = await authKit.getUser(event);
	if (!user) throw redirect(302, '/login');

	const sessionUser: SessionUser = {
		id: user.id,
		email: user.email,
		firstName: user.firstName ?? null,
		lastName: user.lastName ?? null,
		profilePictureUrl: user.profilePictureUrl ?? null
	};
	return { user: sessionUser };
};
