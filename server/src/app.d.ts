// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type {IdentityInfo} from "$lib/types";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			identity?: IdentityInfo
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module "not-typed";

export {};
