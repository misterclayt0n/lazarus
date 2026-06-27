import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query, type QueryCtx } from './_generated/server';
import { addMuscleVolume, estimatedOneRepMax } from './lib/training';

async function summarize(ctx: QueryCtx, sessionId: Id<'sessions'>) {
	const [blocks, sets] = await Promise.all([
		ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', sessionId))
			.take(200),
		ctx.db
			.query('sessionSets')
			.withIndex('by_session', (q) => q.eq('sessionId', sessionId))
			.take(1000)
	]);
	let workingSets = 0;
	let tonnageKg = 0;
	for (const set of sets) {
		if (set.isWarmup || set.completed === false) continue;
		workingSets += 1;
		tonnageKg += set.kg * set.reps;
	}
	return { exerciseCount: blocks.length, totalSets: sets.length, workingSets, tonnageKg };
}

// Walk an exercise's whole set history oldest-first and flag the sets that set a
// new estimated-1RM record at the moment they were logged. That is a real PR.
function personalRecordSetIds(history: Doc<'sessionSets'>[]): Set<string> {
	const ordered = history
		.filter((set) => !set.isWarmup && set.completed !== false)
		.sort((a, b) => a.createdAt - b.createdAt);
	const prs = new Set<string>();
	let best = 0;
	for (const set of ordered) {
		const e1rm = estimatedOneRepMax(set.kg, set.reps);
		if (e1rm > best + 1e-9) {
			prs.add(set._id);
			best = e1rm;
		}
	}
	return prs;
}

export const start = mutation({
	args: { title: v.optional(v.string()) },
	handler: async (ctx, args) =>
		ctx.db.insert('sessions', { startedAt: Date.now(), title: args.title })
});

export const active = query({
	args: {},
	handler: async (ctx) => {
		const recent = await ctx.db.query('sessions').withIndex('by_startedAt').order('desc').take(20);
		return recent.find((session) => session.completedAt === undefined) ?? null;
	}
});

export const list = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const limit = Math.min(args.limit ?? 40, 100);
		const sessions = await ctx.db
			.query('sessions')
			.withIndex('by_startedAt')
			.order('desc')
			.take(limit);
		return Promise.all(
			sessions.map(async (session) => ({
				...session,
				summary: await summarize(ctx, session._id)
			}))
		);
	}
});

export const get = query({
	args: { id: v.id('sessions') },
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.id);
		if (!session) return null;

		const blocks = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', session._id))
			.take(100);
		blocks.sort((a, b) => a.order - b.order);

		const exercises = await Promise.all(
			blocks.map(async (block) => {
				const exercise = await ctx.db.get(block.exerciseId);
				const [sets, history] = await Promise.all([
					ctx.db
						.query('sessionSets')
						.withIndex('by_session_and_exercise', (q) =>
							q.eq('sessionId', session._id).eq('exerciseId', block.exerciseId)
						)
						.take(200),
					ctx.db
						.query('sessionSets')
						.withIndex('by_exercise', (q) => q.eq('exerciseId', block.exerciseId))
						.take(2000)
				]);
				sets.sort((a, b) => a.order - b.order);
				const prIds = personalRecordSetIds(history);
				let bestE1rm = 0;
				for (const set of history) {
					if (set.isWarmup || set.completed === false) continue;
					bestE1rm = Math.max(bestE1rm, estimatedOneRepMax(set.kg, set.reps));
				}
				const imageUrl = exercise?.pictureStorageId
					? await ctx.storage.getUrl(exercise.pictureStorageId)
					: null;
				return {
					sessionExerciseId: block._id,
					order: block.order,
					exercise: exercise ? { ...exercise, imageUrl } : null,
					sets: sets.map((set) => ({
						...set,
						isPR: prIds.has(set._id),
						e1rm: estimatedOneRepMax(set.kg, set.reps)
					})),
					bestE1rm
				};
			})
		);

		let workingSets = 0;
		let tonnageKg = 0;
		const muscleVolume: Record<string, number> = {};
		for (const block of exercises) {
			const working = block.sets.filter((set) => !set.isWarmup && set.completed !== false);
			workingSets += working.length;
			for (const set of working) tonnageKg += set.kg * set.reps;
			if (block.exercise)
				addMuscleVolume(muscleVolume, block.exercise.muscleGroups, working.length);
		}

		return {
			session,
			exercises,
			totals: { exerciseCount: exercises.length, workingSets, tonnageKg, muscleVolume }
		};
	}
});

export const complete = mutation({
	args: { id: v.id('sessions') },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { completedAt: Date.now() });
		return null;
	}
});

export const reopen = mutation({
	args: { id: v.id('sessions') },
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { completedAt: undefined });
		return null;
	}
});

export const update = mutation({
	args: {
		id: v.id('sessions'),
		title: v.optional(v.string()),
		notes: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const patch: Partial<Doc<'sessions'>> = {};
		if (args.title !== undefined) patch.title = args.title;
		if (args.notes !== undefined) patch.notes = args.notes;
		await ctx.db.patch(args.id, patch);
		return null;
	}
});

export const addExercise = mutation({
	args: { sessionId: v.id('sessions'), exerciseId: v.id('exercises') },
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session_and_exercise', (q) =>
				q.eq('sessionId', args.sessionId).eq('exerciseId', args.exerciseId)
			)
			.unique();
		if (existing) return existing._id;
		const blocks = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.take(200);
		return ctx.db.insert('sessionExercises', {
			sessionId: args.sessionId,
			exerciseId: args.exerciseId,
			order: blocks.length,
			createdAt: Date.now()
		});
	}
});

export const removeExercise = mutation({
	args: { sessionId: v.id('sessions'), exerciseId: v.id('exercises') },
	handler: async (ctx, args) => {
		const block = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session_and_exercise', (q) =>
				q.eq('sessionId', args.sessionId).eq('exerciseId', args.exerciseId)
			)
			.unique();
		if (block) await ctx.db.delete(block._id);
		const sets = await ctx.db
			.query('sessionSets')
			.withIndex('by_session_and_exercise', (q) =>
				q.eq('sessionId', args.sessionId).eq('exerciseId', args.exerciseId)
			)
			.take(500);
		for (const set of sets) await ctx.db.delete(set._id);
		return null;
	}
});

export const remove = mutation({
	args: { id: v.id('sessions') },
	handler: async (ctx, args) => {
		const blocks = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', args.id))
			.take(500);
		for (const block of blocks) await ctx.db.delete(block._id);
		const sets = await ctx.db
			.query('sessionSets')
			.withIndex('by_session', (q) => q.eq('sessionId', args.id))
			.take(2000);
		for (const set of sets) await ctx.db.delete(set._id);
		await ctx.db.delete(args.id);
		return null;
	}
});
