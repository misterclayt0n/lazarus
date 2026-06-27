import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { ConvexClient } from 'convex/browser';
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';

let client: ConvexClient | null = null;

/** Lazily create the singleton browser client. Called only from the browser. */
export function convexClient(): ConvexClient {
	if (client) return client;
	if (!PUBLIC_CONVEX_URL) throw new Error('PUBLIC_CONVEX_URL is not set at build time.');
	client = new ConvexClient(PUBLIC_CONVEX_URL);
	return client;
}

export interface QueryState<T> {
	readonly data: T | undefined;
	readonly error: Error | undefined;
	readonly isLoading: boolean;
}

/**
 * Reactive Convex query bound to Svelte 5 runes. Call at component init; pass a
 * thunk for args so the subscription re-targets when reactive args change. Data
 * streams live over Convex's websocket.
 */
export function useQuery<Query extends FunctionReference<'query'>>(
	query: Query,
	getArgs: () => FunctionArgs<Query>
): QueryState<FunctionReturnType<Query>> {
	let data = $state<FunctionReturnType<Query> | undefined>(undefined);
	let error = $state<Error | undefined>(undefined);
	let isLoading = $state(true);

	$effect(() => {
		const args = getArgs();
		if (data === undefined) isLoading = true;
		const unsubscribe = convexClient().onUpdate(
			query,
			args,
			(value) => {
				data = value;
				error = undefined;
				isLoading = false;
			},
			(err) => {
				error = err;
				isLoading = false;
			}
		);
		return unsubscribe;
	});

	return {
		get data() {
			return data;
		},
		get error() {
			return error;
		},
		get isLoading() {
			return isLoading;
		}
	};
}
