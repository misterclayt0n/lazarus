import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { mutation, query, type QueryCtx } from './_generated/server';
import { muscleContribution } from './schema';

async function withImageUrl(ctx: QueryCtx, exercise: Doc<'exercises'>) {
	const imageUrl = exercise.pictureStorageId
		? await ctx.storage.getUrl(exercise.pictureStorageId)
		: null;
	return { ...exercise, imageUrl };
}

export const list = query({
	args: {
		muscleGroup: v.optional(v.string()),
		search: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Personal catalog: bounded read ordered by name, filtered in memory.
		const exercises = await ctx.db.query('exercises').withIndex('by_name').take(500);
		const search = args.search?.trim().toLowerCase();
		const matched = exercises.filter((exercise) => {
			if (
				args.muscleGroup &&
				!exercise.muscleGroups.some((m) => m.muscleGroup === args.muscleGroup)
			) {
				return false;
			}
			if (search && !exercise.name.toLowerCase().includes(search)) return false;
			return true;
		});
		return Promise.all(matched.map((exercise) => withImageUrl(ctx, exercise)));
	}
});

export const get = query({
	args: { id: v.id('exercises') },
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.id);
		return exercise ? withImageUrl(ctx, exercise) : null;
	}
});

export const create = mutation({
	args: {
		name: v.string(),
		muscleGroups: v.array(muscleContribution),
		pictureStorageId: v.optional(v.id('_storage'))
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		return ctx.db.insert('exercises', {
			name: args.name.trim(),
			muscleGroups: args.muscleGroups,
			pictureStorageId: args.pictureStorageId,
			createdAt: now,
			updatedAt: now
		});
	}
});

export const update = mutation({
	args: {
		id: v.id('exercises'),
		name: v.optional(v.string()),
		muscleGroups: v.optional(v.array(muscleContribution)),
		pictureStorageId: v.optional(v.id('_storage'))
	},
	handler: async (ctx, args) => {
		const patch: Partial<Doc<'exercises'>> = { updatedAt: Date.now() };
		if (args.name !== undefined) patch.name = args.name.trim();
		if (args.muscleGroups !== undefined) patch.muscleGroups = args.muscleGroups;
		if (args.pictureStorageId !== undefined) patch.pictureStorageId = args.pictureStorageId;
		await ctx.db.patch(args.id, patch);
		return null;
	}
});

export const remove = mutation({
	args: { id: v.id('exercises') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return null;
	}
});

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => ctx.storage.generateUploadUrl()
});
