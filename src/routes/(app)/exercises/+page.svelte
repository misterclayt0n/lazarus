<script lang="ts">
	import { cn } from '$lib/utils';
	import { useQuery } from '$lib/convex/client.svelte';
	import { api } from '$lib/convex/api';
	import { MUSCLE_GROUPS } from '$lib/domain/muscles';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import ExerciseCard from '$lib/components/exercise-card.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import ResponsiveModal from '$lib/components/responsive-modal.svelte';
	import ExerciseForm from '$lib/components/exercise-form.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';

	let search = $state('');
	let activeMuscle = $state<string | null>(null);
	let createOpen = $state(false);

	const exercises = useQuery(api.exercises.list, () => ({
		muscleGroup: activeMuscle ?? undefined,
		search: search.trim() || undefined
	}));
</script>

<header class="mb-5 flex items-end justify-between gap-4">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Exercises</h1>
		<p class="text-muted-foreground mt-1 text-sm">Your movement library, tagged by muscle.</p>
	</div>
	<Button onclick={() => (createOpen = true)} class="gap-1.5">
		<Plus class="size-4" />
		<span class="hidden sm:inline">New exercise</span>
		<span class="sm:hidden">New</span>
	</Button>
</header>

<div class="relative mb-3">
	<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
	<Input bind:value={search} placeholder="Search exercises" class="pl-9" />
</div>

<div class="-mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
	<button
		onclick={() => (activeMuscle = null)}
		class={cn(
			'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors active:scale-95',
			activeMuscle === null
				? 'border-primary bg-primary text-primary-foreground'
				: 'border-border text-muted-foreground hover:text-foreground'
		)}
	>
		All
	</button>
	{#each MUSCLE_GROUPS as m (m.id)}
		<button
			onclick={() => (activeMuscle = m.id)}
			class={cn(
				'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors active:scale-95',
				activeMuscle === m.id
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border text-muted-foreground hover:text-foreground'
			)}
		>
			{m.label}
		</button>
	{/each}
</div>

{#if exercises.isLoading && exercises.data === undefined}
	<div class="grid gap-3 sm:grid-cols-2">
		{#each [0, 1, 2, 3] as i (i)}
			<Skeleton class="h-[86px] w-full rounded-xl" />
		{/each}
	</div>
{:else if exercises.data && exercises.data.length > 0}
	<div class="grid gap-3 sm:grid-cols-2">
		{#each exercises.data as exercise (exercise._id)}
			<ExerciseCard {exercise} />
		{/each}
	</div>
{:else}
	<EmptyState
		icon={Dumbbell}
		title={search || activeMuscle ? 'No matches' : 'No exercises yet'}
		description={search || activeMuscle
			? 'Try a different search or filter.'
			: 'Create your first exercise to start tracking volume.'}
	>
		{#snippet action()}
			<Button onclick={() => (createOpen = true)} class="gap-1.5">
				<Plus class="size-4" /> New exercise
			</Button>
		{/snippet}
	</EmptyState>
{/if}

<ResponsiveModal
	bind:open={createOpen}
	title="New exercise"
	description="Name it, tag the muscles it trains, optionally add a photo."
>
	{#snippet children()}
		<ExerciseForm ondone={() => (createOpen = false)} />
	{/snippet}
</ResponsiveModal>
