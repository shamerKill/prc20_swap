import { useEffect, useState } from "react";


// async load function
// example: function = useCustomLazyService('demo', 'add');
export const useCustomLazyService = <T extends Function>(
	path: string,
	func: string,
): T | undefined => {
	const [includedFunc, setIncludedFunc] = useState<{
		call?: T
	}>({});

	// 获取方法
	useEffect(() => {
		(async () => {
			let res;
			switch (path) {
				// case 'demo': res = await import('$services/demo'); break;
			}
			if (res && (res as any)[func]) {
				setIncludedFunc({ call: (res as any)[func] });
			}
		})();
	}, []);

	return includedFunc.call;
};