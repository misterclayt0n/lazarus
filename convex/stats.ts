import { query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { addMuscleVolume } from './lib/training';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const weekly = query({
	args: {},
	handler: async (ctx) => {
		const since = Date.now() - WEEK_MS;
		const sessions = await ctx.db
			.query('sessions')
			.withIndex('by_startedAt', (q) => q.gte('startedAt', since))
			.take(100);

		let workingSets = 0;
		let tonnageKg = 0;
		const muscleVolume: Record<string, number> = {};
		// Exercises repeat across sessions; cache lookups so a week's worth of work
		// stays within one cheap transaction.
		const exerciseCache = new Map<Id<'exercises'>, Doc<'exercises'> | null>();

		for (const session of sessions) {
			const sets = await ctx.db
				.query('sessionSets')
				.withIndex('by_session', (q) => q.eq('sessionId', session._id))
				.take(1000);
			const workingPerExercise = new Map<Id<'exercises'>, number>();
			for (const set of sets) {
				if (set.isWarmup) continue;
				workingSets += 1;
				tonnageKg += set.kg * set.reps;
				workingPerExercise.set(set.exerciseId, (workingPerExercise.get(set.exerciseId) ?? 0) + 1);
			}
			for (const [exerciseId, working] of workingPerExercise) {
				let exercise = exerciseCache.get(exerciseId);
				if (exercise === undefined) {
					exercise = await ctx.db.get(exerciseId);
					exerciseCache.set(exerciseId, exercise);
				}
				if (exercise) addMuscleVolume(muscleVolume, exercise.muscleGroups, working);
			}
		}

		return { since, sessionCount: sessions.length, workingSets, tonnageKg, muscleVolume };
	}
});
