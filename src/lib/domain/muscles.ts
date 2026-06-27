export type Priority = 'primary' | 'secondary';

export type MuscleRegion = 'Push' | 'Pull' | 'Legs' | 'Core';

export type MuscleGroup = {
	id: string;
	label: string;
	region: MuscleRegion;
};

// The canonical muscle catalog. Stored as plain strings on exercises, validated
// against this list in the UI.
export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
	{ id: 'chest', label: 'Chest', region: 'Push' },
	{ id: 'front-delts', label: 'Front Delts', region: 'Push' },
	{ id: 'side-delts', label: 'Side Delts', region: 'Push' },
	{ id: 'triceps', label: 'Triceps', region: 'Push' },
	{ id: 'lats', label: 'Lats', region: 'Pull' },
	{ id: 'traps', label: 'Traps', region: 'Pull' },
	{ id: 'rear-delts', label: 'Rear Delts', region: 'Pull' },
	{ id: 'biceps', label: 'Biceps', region: 'Pull' },
	{ id: 'forearms', label: 'Forearms', region: 'Pull' },
	{ id: 'quads', label: 'Quads', region: 'Legs' },
	{ id: 'hamstrings', label: 'Hamstrings', region: 'Legs' },
	{ id: 'glutes', label: 'Glutes', region: 'Legs' },
	{ id: 'adductors', label: 'Adductors', region: 'Legs' },
	{ id: 'calves', label: 'Calves', region: 'Legs' },
	{ id: 'abs', label: 'Abs', region: 'Core' }
];

export const MUSCLE_REGIONS: readonly MuscleRegion[] = ['Push', 'Pull', 'Legs', 'Core'];

const labelById: Record<string, string> = Object.fromEntries(
	MUSCLE_GROUPS.map((m) => [m.id, m.label])
);

/** Human label for a stored muscle id, falling back to the raw id. */
export function muscleLabel(id: string): string {
	return labelById[id] ?? id;
}
