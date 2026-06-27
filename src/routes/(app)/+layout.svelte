<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppShell from '$lib/components/app-shell.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<AppShell user={data.user}>
	{@render children()}
</AppShell>
