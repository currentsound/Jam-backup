import { API } from "sveltekit-api";

export default new API(import.meta.glob("./**/*.ts"), {
	openapi: "3.0.0",
	info: {
		title: "Jam Pantry API",
		version: "1.0.0",
		description: "API for the Jam Pantry Server",
	},
});
