<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
</script>

<svelte:head>
	<title>Sign in · Lazarus</title>
</svelte:head>

<div class="relative grid min-h-svh place-items-center overflow-hidden px-6">
	<div
		class="bg-primary/10 pointer-events-none absolute -top-40 left-1/2 size-[32rem] -translate-x-1/2 rounded-full blur-3xl"
	></div>

	<div class="relative w-full max-w-sm text-center">
		<div
			class="bg-primary text-primary-foreground mx-auto grid size-14 place-items-center rounded-2xl shadow-[0_0_44px_-8px_var(--primary)]"
		>
			<Dumbbell class="size-7" />
		</div>
		<h1 class="mt-6 text-3xl font-bold tracking-tight">Lazarus</h1>
		<p class="text-muted-foreground mt-2 text-sm">Track every set. Watch the numbers climb.</p>

		<Button href="/sign-in" size="lg" class="mt-8 w-full gap-1.5" data-sveltekit-reload>
			Sign in
			<ArrowRight class="size-4" />
		</Button>

		<p class="text-muted-foreground mt-4 text-xs">Secure sign-in powered by WorkOS</p>
	</div>
</div>
