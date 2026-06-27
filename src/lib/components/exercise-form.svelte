<script lang="ts">
	import { untrack } from 'svelte';
	import { Effect } from 'effect';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { api } from '$lib/convex/api';
	import { convexClient } from '$lib/convex/client.svelte';
	import { uploadExerciseImage } from '$lib/convex/upload';
	import { MUSCLE_GROUPS, MUSCLE_REGIONS } from '$lib/domain/muscles';
	import type { Priority } from '$lib/domain/muscles';
	import type { ExerciseListItem } from '$lib/domain/types';
	import ImageIcon from '@lucide/svelte/icons/image';
	import XIcon from '@lucide/svelte/icons/x';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	let { exercise, ondone }: { exercise?: ExerciseListItem; ondone?: () => void } = $props();

	const editing = $derived(!!exercise);

	let name = $state(untrack(() => exercise?.name ?? ''));
	let selections = $state<Record<string, Priority>>(
		untrack(() =>
			exercise
				? Object.fromEntries(exercise.muscleGroups.map((m) => [m.muscleGroup, m.priority]))
				: {}
		)
	);
	let file = $state<File | null>(null);
	let previewUrl = $state<string | null>(untrack(() => exercise?.imageUrl ?? null));
	let saving = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	const selectedCount = $derived(Object.keys(selections).length);
	const canSubmit = $derived(name.trim().length > 0 && selectedCount > 0 && !saving);

	function cycle(id: string) {
		const current = selections[id];
		const next = { ...selections };
		if (!current) next[id] = 'primary';
		else if (current === 'primary') next[id] = 'secondary';
		else delete next[id];
		selections = next;
	}

	function onFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const picked = input.files?.[0] ?? null;
		if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
		file = picked;
		previewUrl = picked ? URL.createObjectURL(picked) : null;
	}

	function clearImage() {
		if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
		file = null;
		previewUrl = null;
		if (fileInput) fileInput.value = '';
	}

	async function submit() {
		if (!canSubmit) return;
		saving = true;
		try {
			const uploaded = file ? await Effect.runPromise(uploadExerciseImage(file)) : undefined;
			const muscleGroups = Object.entries(selections).map(([muscleGroup, priority]) => ({
				muscleGroup,
				priority,
				volumeMultiplier: priority === 'primary' ? (1 as const) : (0.5 as const)
			}));
			if (exercise) {
				await convexClient().mutation(api.exercises.update, {
					id: exercise._id,
					name: name.trim(),
					muscleGroups,
					pictureStorageId: uploaded ?? exercise.pictureStorageId
				});
				toast.success('Exercise updated');
			} else {
				await convexClient().mutation(api.exercises.create, {
					name: name.trim(),
					muscleGroups,
					pictureStorageId: uploaded
				});
				toast.success(`${name.trim()} added`);
			}
			ondone?.();
		} catch (error) {
			toast.error(editing ? 'Could not update exercise' : 'Could not create exercise', {
				description: String(error)
			});
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex flex-col gap-5 py-1">
	<div class="flex flex-col gap-2">
		<Label for="ex-name">Name</Label>
		<Input id="ex-name" bind:value={name} placeholder="e.g. Barbell Bench Press" autocomplete="off" />
	</div>

	<div class="flex flex-col gap-2">
		<Label>Picture <span class="text-muted-foreground font-normal">· optional</span></Label>
		<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={onFile} />
		{#if previewUrl}
			<div class="border-border/60 relative w-full overflow-hidden rounded-lg border">
				<img src={previewUrl} alt="Preview" class="h-40 w-full object-cover" />
				<Button
					type="button"
					variant="secondary"
					size="icon-sm"
					class="absolute top-2 right-2"
					onclick={clearImage}
				>
					<XIcon />
				</Button>
			</div>
		{:else}
			<button
				type="button"
				onclick={() => fileInput?.click()}
				class="border-border/70 text-muted-foreground hover:border-border hover:text-foreground flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors"
			>
				<ImageIcon class="size-5" />
				<span class="text-sm">Add a photo</span>
			</button>
		{/if}
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between gap-2">
			<Label>Muscle groups</Label>
			<span class="text-muted-foreground text-[11px]">
				tap to cycle · <span class="text-primary">1×</span> → 0.5× → off
			</span>
		</div>
		<div class="flex flex-col gap-3">
			{#each MUSCLE_REGIONS as region (region)}
				<div>
					<p class="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wide uppercase">
						{region}
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each MUSCLE_GROUPS.filter((m) => m.region === region) as m (m.id)}
							{@const pick = selections[m.id]}
							<button
								type="button"
								onclick={() => cycle(m.id)}
								class={cn(
									'rounded-full border px-2.5 py-1 text-xs font-medium transition-all active:scale-95',
									pick === 'primary'
										? 'border-primary bg-primary text-primary-foreground'
										: pick === 'secondary'
											? 'border-primary/40 bg-primary/15 text-primary'
											: 'border-border text-muted-foreground hover:text-foreground bg-transparent'
								)}
							>
								{m.label}{#if pick === 'primary'} · 1×{:else if pick === 'secondary'} · 0.5×{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<Button onclick={submit} disabled={!canSubmit} size="lg" class="w-full">
		{#if saving}
			<Loader2 class="size-4 animate-spin" /> Saving…
		{:else}
			{editing ? 'Save changes' : 'Create exercise'}
		{/if}
	</Button>
</div>
