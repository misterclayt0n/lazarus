import { Effect } from 'effect';

export const runPromise = <A, E>(effect: Effect.Effect<A, E, never>) => Effect.runPromise(effect);

export const appInfo = Effect.succeed({
	name: 'lazarus',
	purpose: 'personal trainer tracker'
} as const);
