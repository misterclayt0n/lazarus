<script lang="ts">
	import { page } from '$app/state';
	import SessionScreen from '$lib/components/session-screen.svelte';
	import type { Id } from '$lib/convex/api';

	const sessionId = $derived(page.params.id as Id<'sessions'>);
</script>

<SessionScreen {sessionId} />
