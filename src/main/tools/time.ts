export const toolTimeSleep = async (time: number, callBack?: () => void) => {
	return new Promise(resolve => {
		setTimeout(() => {
			if (callBack) callBack();
			resolve(true);
		}, time);
	});
};
// 时间补零
const fillZero = (n: number): string => n < 10 ? '0' + n : '' + n;

export const timestampToTime = (timestamp:number) => {
	let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	let Y = date.getFullYear() + '-';
	let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	let D = fillZero(date.getDate()) + ' ';
	let h = fillZero(date.getHours()) + ':';
	let m = fillZero(date.getMinutes()) + ':';
	let s = fillZero(date.getSeconds());
	return Y+M+D+h+m+s;
}