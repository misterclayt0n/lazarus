import type { Doc, Id } from '$lib/convex/api';

export type ExerciseDoc = Doc<'exercises'>;

/** An exercise plus its resolved (signed) image URL, as returned by queries. */
export type ExerciseListItem = ExerciseDoc & { imageUrl: string | null };

export type MuscleContribution = ExerciseDoc['muscleGroups'][number];

export type SessionSetView = Doc<'sessionSets'> & { isPR: boolean; e1rm: number };

export type SessionExerciseBlock = {
	sessionExerciseId: Id<'sessionExercises'>;
	order: number;
	exercise: ExerciseListItem | null;
	sets: SessionSetView[];
	bestE1rm: number;
};

export type SessionTotals = {
	exerciseCount: number;
	workingSets: number;
	tonnageKg: number;
	muscleVolume: Record<string, number>;
};

export type SessionDetail = {
	session: Doc<'sessions'>;
	exercises: SessionExerciseBlock[];
	totals: SessionTotals;
};
