// 格式化route search为对象
export const toolFormatSearch = <T extends {[key: string]: string}>(source?: string) => {
	const result: {[key: string]: string} = {};
	if (!source) return result;
	source.replace('?', '').replace(/([^\&]*?)=([^&]*)/g, (_, k, v) => {
		result[k] = v;
		return '';
	});
	return result as T;
};

// 格式化route path为数组
export const toolFormatPath = (source: string): string[] => {
	return source.split('/').filter(item => item !== '');
}