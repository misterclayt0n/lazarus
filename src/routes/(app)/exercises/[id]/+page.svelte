<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { useQuery, convexClient } from '$lib/convex/client.svelte';
	import { api, type Id } from '$lib/convex/api';
	import { formatKg, formatRelativeDay, formatDay } from '$lib/format';
	import MusclePill from '$lib/components/muscle-pill.svelte';
	import StatTile from '$lib/components/stat-tile.svelte';
	import E1rmChart from '$lib/components/e1rm-chart.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import ResponsiveModal from '$lib/components/responsive-modal.svelte';
	import ExerciseForm from '$lib/components/exercise-form.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import LineChartIcon from '@lucide/svelte/icons/chart-line';

	const exerciseId = $derived(page.params.id as Id<'exercises'>);
	const analytics = useQuery(api.exercises.analytics, () => ({ id: exerciseId }));
	const data = $derived(analytics.data);

	let editOpen = $state(false);
	let discardOpen = $state(false);
	let discarding = $state(false);

	const sortedMuscles = $derived(
		data
			? [...data.exercise.muscleGroups].sort((a, b) =>
					a.priority === b.priority ? 0 : a.priority === 'primary' ? -1 : 1
				)
			: []
	);

	async function remove() {
		discarding = true;
		try {
			await convexClient().mutation(api.exercises.remove, { id: exerciseId });
			toast.success('Exercise deleted');
			await goto('/exercises');
		} catch (error) {
			toast.error('Could not delete exercise', { description: String(error) });
			discarding = false;
		}
	}
</script>

<a
	href="/exercises"
	class="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
>
	<ArrowLeft class="size-4" /> Exercises
</a>

{#if analytics.isLoading && data === undefined}
	<div class="flex flex-col gap-4">
		<Skeleton class="h-16 w-2/3 rounded-xl" />
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each [0, 1, 2, 3] as i (i)}
				<Skeleton class="h-20 rounded-xl" />
			{/each}
		</div>
		<Skeleton class="h-64 w-full rounded-xl" />
	</div>
{:else if !data}
	<EmptyState icon={Dumbbell} title="Exercise not found" description="It may have been deleted.">
		{#snippet action()}
			<Button href="/exercises">Back to exercises</Button>
		{/snippet}
	</EmptyState>
{:else}
	<header class="mb-6 flex items-start gap-4">
		<div
			class="bg-muted ring-border/50 grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl ring-1"
		>
			{#if data.exercise.imageUrl}
				<img src={data.exercise.imageUrl} alt={data.exercise.name} class="size-full object-cover" />
			{:else}
				<Dumbbell class="text-muted-foreground size-7" />
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<h1 class="truncate text-2xl font-bold tracking-tight">{data.exercise.name}</h1>
			<div class="mt-1.5 flex flex-wrap gap-1.5">
				{#each sortedMuscles as mg (mg.muscleGroup)}
					<MusclePill muscleGroup={mg.muscleGroup} priority={mg.priority} />
				{/each}
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<Button variant="outline" class="gap-1.5" onclick={() => (editOpen = true)}>
				<Pencil class="size-4" /> Edit
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="text-muted-foreground hover:text-destructive"
				aria-label="Delete exercise"
				onclick={() => (discardOpen = true)}
			>
				<Trash2 class="size-4" />
			</Button>
		</div>
	</header>

	{#if data.summary.workingSets === 0}
		<EmptyState
			icon={LineChartIcon}
			title="No data yet"
			description="Log some working sets of this exercise and your strength trend shows up here."
		/>
	{:else}
		<div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
			<StatTile label="Best e1RM" value={formatKg(data.summary.bestE1rm)} unit="kg" />
			<StatTile label="Top set" value={formatKg(data.summary.bestWeight)} unit="kg" />
			<StatTile label="Total sets" value={data.summary.workingSets} />
			<StatTile
				label="Last done"
				value={data.summary.lastPerformed ? formatRelativeDay(data.summary.lastPerformed) : '—'}
			/>
		</div>

		<Card.Root class="mb-5">
			<Card.Header>
				<Card.Title class="text-base">Estimated 1RM</Card.Title>
				<Card.Description>Each session's best e1RM, over time.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="mb-4 flex items-end gap-3">
					<span class="text-3xl font-bold tabular-nums">
						{formatKg(data.summary.current)}<span class="text-muted-foreground text-base"> kg</span>
					</span>
					{#if data.summary.trend !== 0}
						<span
							class={cn(
								'mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
								data.summary.trend > 0
									? 'bg-primary/15 text-primary'
									: 'bg-muted text-muted-foreground'
							)}
						>
							{#if data.summary.trend > 0}
								<TrendingUp class="size-3" /> +{formatKg(data.summary.trend)}
							{:else}
								<TrendingDown class="size-3" /> {formatKg(data.summary.trend)}
							{/if}
						</span>
					{/if}
				</div>
				<E1rmChart points={data.points} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Best by reps</Card.Title>
				<Card.Description>Heaviest weight you've logged at each rep count.</Card.Description>
			</Card.Header>
			<Card.Content class="px-0">
				<div
					class="text-muted-foreground grid grid-cols-[2.5rem_1fr_1fr_auto] gap-2 px-6 pb-1 text-[10px] font-medium tracking-wide uppercase"
				>
					<span>Reps</span>
					<span>Weight</span>
					<span>e1RM</span>
					<span class="text-right">Date</span>
				</div>
				{#each data.bestByReps as row (row.reps)}
					<div
						class="border-border/40 grid grid-cols-[2.5rem_1fr_1fr_auto] items-center gap-2 border-t px-6 py-2 text-sm"
					>
						<span class="font-semibold tabular-nums">{row.reps}</span>
						<span class="tabular-nums">{formatKg(row.weight)} kg</span>
						<span class="text-muted-foreground tabular-nums">{formatKg(row.e1rm)} kg</span>
						<span class="text-muted-foreground text-right text-xs tabular-nums">
							{formatDay(row.date)}
						</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<ResponsiveModal
		bind:open={editOpen}
		title="Edit exercise"
		description="Update its name, muscles, or photo."
	>
		{#snippet children()}
			<ExerciseForm exercise={data.exercise} ondone={() => (editOpen = false)} />
		{/snippet}
	</ResponsiveModal>

	<AlertDialog.Root bind:open={discardOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete {data.exercise.name}?</AlertDialog.Title>
				<AlertDialog.Description>
					This removes it from your library. Sets already logged in past sessions are kept, but will
					show as a removed exercise.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel disabled={discarding}>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action variant="destructive" onclick={remove} disabled={discarding}>
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
