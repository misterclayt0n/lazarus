<script lang="ts">
	import { useQuery } from '$lib/convex/client.svelte';
	import { api, type Id } from '$lib/convex/api';
	import ResponsiveModal from '$lib/components/responsive-modal.svelte';
	import ExerciseForm from '$lib/components/exercise-form.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import Check from '@lucide/svelte/icons/check';

	let {
		open = $bindable(false),
		existingIds = [],
		onpick
	}: {
		open?: boolean;
		existingIds?: Id<'exercises'>[];
		onpick: (id: Id<'exercises'>) => void;
	} = $props();

	let search = $state('');
	let creating = $state(false);

	const exercises = useQuery(api.exercises.list, () => ({ search: search.trim() || undefined }));
	const existing = $derived(new Set<string>(existingIds));

	function pick(id: Id<'exercises'>) {
		if (existing.has(id)) return;
		onpick(id);
		open = false;
	}
</script>

<ResponsiveModal
	bind:open
	title={creating ? 'New exercise' : 'Add exercise'}
	description={creating ? undefined : 'Pick from your library, or create a new one.'}
>
	{#snippet children()}
		{#if creating}
			<ExerciseForm ondone={() => (creating = false)} />
		{:else}
			<div class="flex flex-col gap-3 py-1">
				<div class="relative">
					<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input bind:value={search} placeholder="Search exercises" class="pl-9" />
				</div>
				<Button variant="outline" class="w-full gap-1.5" onclick={() => (creating = true)}>
					<Plus class="size-4" /> Create new exercise
				</Button>

				{#if exercises.isLoading && exercises.data === undefined}
					<div class="flex flex-col gap-2">
						{#each [0, 1, 2] as i (i)}
							<Skeleton class="h-14 w-full rounded-lg" />
						{/each}
					</div>
				{:else if exercises.data && exercises.data.length > 0}
					<div class="flex flex-col gap-1.5">
						{#each exercises.data as exercise (exercise._id)}
							{@const added = existing.has(exercise._id)}
							<button
								type="button"
								disabled={added}
								onclick={() => pick(exercise._id)}
								class={cn(
									'border-border/60 flex items-center gap-3 rounded-lg border p-2 text-left transition-colors',
									added
										? 'opacity-60'
										: 'hover:border-border hover:bg-muted/40 active:scale-[0.99]'
								)}
							>
								<div
									class="bg-muted ring-border/50 grid size-10 shrink-0 place-items-center overflow-hidden rounded-md ring-1"
								>
									{#if exercise.imageUrl}
										<img src={exercise.imageUrl} alt={exercise.name} class="size-full object-cover" />
									{:else}
										<Dumbbell class="text-muted-foreground size-4" />
									{/if}
								</div>
								<span class="min-w-0 flex-1 truncate text-sm font-medium">{exercise.name}</span>
								{#if added}
									<Check class="text-primary size-4 shrink-0" />
								{:else}
									<Plus class="text-muted-foreground size-4 shrink-0" />
								{/if}
							</button>
						{/each}
					</div>
				{:else}
					<EmptyState
						icon={Dumbbell}
						title={search ? 'No matches' : 'No exercises yet'}
						description="Create one to add it to this session."
					/>
				{/if}
			</div>
		{/if}
	{/snippet}
</ResponsiveModal>
