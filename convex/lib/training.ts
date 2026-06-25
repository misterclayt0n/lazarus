// Pure training math shared across Convex functions. No Convex imports here so it
// stays trivially testable and reusable.

export type Priority = 'primary' | 'secondary';

export type MuscleContribution = {
	muscleGroup: string;
	priority: Priority;
	volumeMultiplier: 1 | 0.5;
};

/**
 * Estimated one-rep max via the Epley formula. A single number that lets us
 * compare sets at different rep ranges, which is how we detect PRs.
 */
export function estimatedOneRepMax(kg: number, reps: number): number {
	if (kg <= 0 || reps <= 0) return 0;
	if (reps === 1) return kg;
	return kg * (1 + reps / 30);
}

/**
 * Per-muscle volume contributed by a number of working sets of one exercise.
 * Volume is counted in sets: a primary muscle gets the full set count, a
 * secondary muscle gets half. Warmups are never passed in here.
 */
export function addMuscleVolume(
	into: Record<string, number>,
	muscleGroups: MuscleContribution[],
	workingSets: number
): void {
	for (const mg of muscleGroups) {
		into[mg.muscleGroup] = (into[mg.muscleGroup] ?? 0) + workingSets * mg.volumeMultiplier;
	}
}
