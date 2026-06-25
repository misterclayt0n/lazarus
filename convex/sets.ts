import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, type MutationCtx } from './_generated/server';

async function ensureExerciseInSession(
	ctx: MutationCtx,
	sessionId: Id<'sessions'>,
	exerciseId: Id<'exercises'>
) {
	const existing = await ctx.db
		.query('sessionExercises')
		.withIndex('by_session_and_exercise', (q) =>
			q.eq('sessionId', sessionId).eq('exerciseId', exerciseId)
		)
		.unique();
	if (existing) return;
	const blocks = await ctx.db
		.query('sessionExercises')
		.withIndex('by_session', (q) => q.eq('sessionId', sessionId))
		.take(200);
	await ctx.db.insert('sessionExercises', {
		sessionId,
		exerciseId,
		order: blocks.length,
		createdAt: Date.now()
	});
}

export const add = mutation({
	args: {
		sessionId: v.id('sessions'),
		exerciseId: v.id('exercises'),
		kg: v.number(),
		reps: v.number(),
		rir: v.optional(v.number()),
		isWarmup: v.boolean()
	},
	handler: async (ctx, args) => {
		await ensureExerciseInSession(ctx, args.sessionId, args.exerciseId);
		const siblings = await ctx.db
			.query('sessionSets')
			.withIndex('by_session_and_exercise', (q) =>
				q.eq('sessionId', args.sessionId).eq('exerciseId', args.exerciseId)
			)
			.take(200);
		return ctx.db.insert('sessionSets', {
			sessionId: args.sessionId,
			exerciseId: args.exerciseId,
			order: siblings.length,
			kg: args.kg,
			reps: args.reps,
			rir: args.rir,
			isWarmup: args.isWarmup,
			createdAt: Date.now()
		});
	}
});

export const update = mutation({
	args: {
		id: v.id('sessionSets'),
		kg: v.optional(v.number()),
		reps: v.optional(v.number()),
		rir: v.optional(v.number()),
		isWarmup: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const patch: Partial<Doc<'sessionSets'>> = {};
		if (args.kg !== undefined) patch.kg = args.kg;
		if (args.reps !== undefined) patch.reps = args.reps;
		if (args.rir !== undefined) patch.rir = args.rir;
		if (args.isWarmup !== undefined) patch.isWarmup = args.isWarmup;
		await ctx.db.patch(args.id, patch);
		return null;
	}
});

export const remove = mutation({
	args: { id: v.id('sessionSets') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return null;
	}
});
