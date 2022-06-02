import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { routeTypeStore } from "$database";
import { toolFormatSearch } from "$tools";


const useCustomRoute = (path: string|number) => {
	const navigate = useNavigate();
	const store = useContext(routeTypeStore);

	const backCall = useCallback(() => {
		if (path === -1) store.type = 'back';
		else store.type = 'go';
		if (typeof path === 'number') navigate(path);
		if (typeof path === 'string') navigate(path);
	}, [navigate, store]);
	return backCall;
};

export const useCustomRouteBack = () => {
	return useCustomRoute(-1);
};

export const useCustomRouteGoTo = (path: string) => {
	return useCustomRoute(path);
}

export const useCustomFormatSearch = <T extends {[key: string]: string}>() => {
	const [ search, setSearch ] = useState<T>();
	const location = useLocation();
	useEffect(() => {
		const res = toolFormatSearch<T>(location.search);
		setSearch(res as T);
	}, [location.search]);
	return search;
};