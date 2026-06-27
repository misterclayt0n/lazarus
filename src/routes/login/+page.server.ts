import { redirect } from '@sveltejs/kit';
import { authKit } from '@workos/authkit-sveltekit';

export const load = async (event) => {
	const user = await authKit.getUser(event);
	if (user) throw redirect(302, '/');
	return {};
};
