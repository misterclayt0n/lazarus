// The slice of the WorkOS user we surface to the UI.
export interface SessionUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profilePictureUrl: string | null;
}
