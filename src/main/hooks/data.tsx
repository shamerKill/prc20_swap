import { dataBaseError } from "$database";
import { useCallback, useEffect, useState } from "react";

// fetch data from server
// func do function
// defaultDo is default do function
// args func args
export const useCustomDataHook = <T extends any, A extends any>(
	func: (...args: A[]) => Promise<T>, defaultDo: boolean = true, ...args: A[]
) => {
	const [fetched, setFetched] = useState<boolean|null>(null);
	const [data, setData] = useState<T|null>(null);
	const [error, setError] = useState<ReturnType<typeof dataBaseError>|null>(null);

	const fetchData = useCallback((...args: A[]) => {
		setFetched(false);
		setData(null);
		func(...args).then(setData).catch(setError).finally(() => setFetched(true));
	}, []);
	
	useEffect(() => {
		if (defaultDo) fetchData(...args);
	}, [defaultDo, fetchData]);

	return {fetched, data, error, fetchData};
};