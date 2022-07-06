import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { toolFormatPath, toolFormatSearch } from "$tools";

// 将route search转成可用对象
export const useCustomFormatSearch = <T extends {[key: string]: string}>() => {
	const [ search, setSearch ] = useState<T>();
	const location = useLocation();
	useEffect(() => {
		const res = toolFormatSearch<T>(location.search);
		setSearch(res as T);
	}, [location.search]);
	return search;
};

// 将route path转成可用数组
export const useCustomRouteFormatPath = (): Array<string> => {
	const [ routePaths, setRoutePaths ] = useState<Array<string>>([]);
	const location = useLocation();
	useEffect(() => {
		const routeArr = toolFormatPath(location.pathname);
		setRoutePaths(routeArr);
	}, [location.pathname]);
	return routePaths;
}