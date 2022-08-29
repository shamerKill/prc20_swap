export const toolTimeSleep = async (time: number, callBack?: () => void) => {
	return new Promise(resolve => {
		setTimeout(() => {
			if (callBack) callBack();
			resolve(true);
		}, time);
	});
};