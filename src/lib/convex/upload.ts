import { Effect } from 'effect';
import { api, type Id } from '$lib/convex/api';
import { convexClient } from '$lib/convex/client.svelte';

export class ImageUploadError {
	readonly _tag = 'ImageUploadError';
	constructor(readonly message: string) {}
}

type UploadResponse = { storageId: Id<'_storage'> };

/**
 * Three-step Convex file upload modeled as an Effect so each failure mode is
 * typed: mint a signed URL, POST the blob, read back the storage id.
 */
export function uploadExerciseImage(file: File): Effect.Effect<Id<'_storage'>, ImageUploadError> {
	return Effect.gen(function* () {
		const client = convexClient();

		const uploadUrl = yield* Effect.tryPromise({
			try: () => client.mutation(api.exercises.generateUploadUrl, {}),
			catch: (cause) => new ImageUploadError(`Could not start upload: ${String(cause)}`)
		});

		const response = yield* Effect.tryPromise({
			try: () =>
				fetch(uploadUrl, {
					method: 'POST',
					headers: { 'Content-Type': file.type },
					body: file
				}),
			catch: (cause) => new ImageUploadError(`Upload request failed: ${String(cause)}`)
		});

		if (!response.ok) {
			return yield* Effect.fail(new ImageUploadError(`Upload failed (${response.status})`));
		}

		const payload = yield* Effect.tryPromise({
			try: () => response.json() as Promise<UploadResponse>,
			catch: (cause) => new ImageUploadError(`Malformed upload response: ${String(cause)}`)
		});

		return payload.storageId;
	});
}
