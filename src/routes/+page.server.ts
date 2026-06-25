import { authKit } from '@workos/authkit-sveltekit';
import { appInfo, runPromise } from '$lib/effect/runtime';

export const load = async (event) => {
	const [user, info] = await Promise.all([authKit.getUser(event), runPromise(appInfo)]);

	return {
		user,
		info
	};
};
