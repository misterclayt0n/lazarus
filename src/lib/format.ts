const kgFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const dayFormatter = new Intl.DateTimeFormat('en-US', {
	weekday: 'short',
	month: 'short',
	day: 'numeric'
});
const clockFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const DAY_MS = 24 * 60 * 60 * 1000;

/** Weight rounded to at most one decimal (60, 62.5), no unit. */
export function formatKg(kg: number): string {
	return kgFormatter.format(kg);
}

/** "Mon, Jun 23" */
export function formatDay(ts: number): string {
	return dayFormatter.format(ts);
}

/** "6:30 PM" */
export function formatClock(ts: number): string {
	return clockFormatter.format(ts);
}

/** Stopwatch elapsed time, always with seconds: "0:05", "12:34", "1:12:34". */
export function formatDuration(ms: number): string {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return hours > 0
		? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
		: `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "Today", "Yesterday", "3d ago", else the calendar day. */
export function formatRelativeDay(ts: number): string {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const diffDays = Math.floor((startOfToday.getTime() - ts) / DAY_MS);
	if (ts >= startOfToday.getTime()) return 'Today';
	if (diffDays === 0) return 'Yesterday';
	if (diffDays < 7) return `${diffDays + 1}d ago`;
	return dayFormatter.format(ts);
}
