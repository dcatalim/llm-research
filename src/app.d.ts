// See https://svelte.dev/docs/kit/types#app.d.ts

import type { TypedPocketBase } from "$lib/pocketbase";
import type { AuthModel } from "pocketbase";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: TypedPocketBase;
			user: AuthModel | undefined;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
