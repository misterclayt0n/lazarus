<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import MusclePill from '$lib/components/muscle-pill.svelte';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import type { ExerciseListItem } from '$lib/domain/types';

	let {
		exercise,
		action,
		class: className
	}: {
		exercise: ExerciseListItem;
		action?: Snippet;
		class?: string;
	} = $props();

	const sorted = $derived(
		[...exercise.muscleGroups].sort((a, b) =>
			a.priority === b.priority ? 0 : a.priority === 'primary' ? -1 : 1
		)
	);
</script>

<div
	class={cn(
		'group border-border/60 bg-card/40 hover:border-border relative flex items-center gap-4 rounded-xl border p-3 transition-colors',
		className
	)}
>
	<div
		class="bg-muted ring-border/50 grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg ring-1"
	>
		{#if exercise.imageUrl}
			<img src={exercise.imageUrl} alt={exercise.name} class="size-full object-cover" />
		{:else}
			<Dumbbell class="text-muted-foreground size-6" />
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<p class="truncate font-semibold">{exercise.name}</p>
		<div class="mt-1.5 flex flex-wrap gap-1.5">
			{#each sorted as mg (mg.muscleGroup)}
				<MusclePill muscleGroup={mg.muscleGroup} priority={mg.priority} />
			{/each}
		</div>
	</div>

	{#if action}
		<div class="shrink-0">{@render action()}</div>
	{/if}
</div>
