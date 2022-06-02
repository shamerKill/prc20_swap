import { createContext } from "react";

export const routeTypeStore = createContext<{
	type: 'back' | 'go',
	list: string[],
}>({type: 'go', list: []});