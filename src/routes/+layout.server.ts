import { authKit } from '@workos/authkit-sveltekit';
import type { SessionUser } from '$lib/auth';

export const load = async (event) => {
	const user = await authKit.getUser(event);
	const sessionUser: SessionUser | null = user
		? {
				id: user.id,
				email: user.email,
				firstName: user.firstName ?? null,
				lastName: user.lastName ?? null,
				profilePictureUrl: user.profilePictureUrl ?? null
			}
		: null;
	return { user: sessionUser };
};
