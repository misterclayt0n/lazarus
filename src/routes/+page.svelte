<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Lazarus</title>
	<meta name="description" content="Personal trainer tracker" />
</svelte:head>

<main>
	<p>{data.info.purpose}</p>
	<h1>{data.info.name}</h1>

	{#if data.user}
		<p>Signed in as {data.user.email}</p>
		<form method="POST" action="/sign-out">
			<button>Sign out</button>
		</form>
	{:else}
		<a href="/sign-in">Sign in with WorkOS</a>
	{/if}
</main>
