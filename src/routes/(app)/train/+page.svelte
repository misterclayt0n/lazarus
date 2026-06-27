<script lang="ts">
	import { goto } from '$app/navigation';
	import { useQuery, convexClient } from '$lib/convex/client.svelte';
	import { api } from '$lib/convex/api';
	import SessionScreen from '$lib/components/session-screen.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Zap from '@lucide/svelte/icons/zap';

	const active = useQuery(api.sessions.active, () => ({}));
	let starting = $state(false);

	async function start() {
		if (starting) return;
		starting = true;
		try {
			const id = await convexClient().mutation(api.sessions.start, {});
			await goto(`/sessions/${id}`);
		} catch {
			starting = false;
		}
	}
</script>

{#if active.isLoading && active.data === undefined}
	<div class="flex flex-col gap-4">
		<Skeleton class="h-24 w-full rounded-xl" />
		<Skeleton class="h-40 w-full rounded-xl" />
	</div>
{:else if active.data}
	<SessionScreen sessionId={active.data._id} />
{:else}
	<div
		class="border-border/60 from-primary/10 relative overflow-hidden rounded-2xl border bg-gradient-to-b to-transparent px-6 py-16 text-center"
	>
		<div
			class="bg-primary text-primary-foreground mx-auto grid size-14 place-items-center rounded-2xl shadow-[0_0_30px_-6px_var(--primary)]"
		>
			<Zap class="size-7" />
		</div>
		<h1 class="mt-5 text-2xl font-bold tracking-tight">Ready to train?</h1>
		<p class="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
			Start an empty session and add exercises as you go. Every working set counts toward your
			volume.
		</p>
		<Button onclick={start} disabled={starting} size="lg" class="mt-6 gap-1.5">
			<Zap class="size-4" />
			{starting ? 'Starting…' : 'Start session'}
		</Button>
	</div>
{/if}
