import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// A single exercise can train several muscles. Primary muscles count as a full
// working set (1.0) toward that muscle's volume; secondary muscles count as half
// (0.5). This is the simple priority system used everywhere we tally volume.
export const muscleContribution = v.object({
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
		title: v.optional(v.string()),
		notes: v.optional(v.string())
	}).index('by_startedAt', ['startedAt']),

	// Exercises added to a session, in display order. Kept as its own table so an
	// exercise can sit in a session with zero sets logged yet.
	sessionExercises: defineTable({
		sessionId: v.id('sessions'),
		exerciseId: v.id('exercises'),
		order: v.number(),
		createdAt: v.number()
	})
		.index('by_session', ['sessionId'])
		.index('by_session_and_exercise', ['sessionId', 'exerciseId']),

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
		.index('by_session_and_exercise', ['sessionId', 'exerciseId'])
});
