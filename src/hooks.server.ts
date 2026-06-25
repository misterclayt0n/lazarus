import { configureAuthKit, authKitHandle } from '@workos/authkit-sveltekit';
import { env } from '$env/dynamic/private';

const requireEnv = (name: string) => {
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
};

configureAuthKit({
	clientId: requireEnv('WORKOS_CLIENT_ID'),
	apiKey: requireEnv('WORKOS_API_KEY'),
	redirectUri: requireEnv('WORKOS_REDIRECT_URI'),
	cookiePassword: requireEnv('WORKOS_COOKIE_PASSWORD')
});

export const handle = authKitHandle();
