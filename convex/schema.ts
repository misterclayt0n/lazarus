import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const muscleContribution = v.object({
	muscleGroup: v.string(),
	priority: v.union(v.literal('primary'), v.literal('secondary')),
	volumeMultiplier: v.union(v.literal(1), v.literal(0.5))
});

export default defineSchema({
	exercises: defineTable({
		name: v.string(),
		pictureStorageId: v.optional(v.id('_storage')),
		muscleGroups: v.array(muscleContribution),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_name', ['name']),
	sessions: defineTable({
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
		notes: v.optional(v.string())
	}).index('by_startedAt', ['startedAt']),
	sessionSets: defineTable({
		sessionId: v.id('sessions'),
		exerciseId: v.id('exercises'),
		order: v.number(),
		kg: v.number(),
		reps: v.number(),
		rir: v.optional(v.number()),
		isWarmup: v.boolean(),
		createdAt: v.number()
	})
		.index('by_session', ['sessionId'])
		.index('by_exercise', ['exerciseId'])
});
