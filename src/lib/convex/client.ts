import { env } from '$env/dynamic/public';
import { ConvexClient } from 'convex/browser';

export const convex = env.PUBLIC_CONVEX_URL ? new ConvexClient(env.PUBLIC_CONVEX_URL) : undefined;
