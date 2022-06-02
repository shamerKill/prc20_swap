export const toolFormatSearch = <T extends {[key: string]: string}>(source?: string) => {
	const result: {[key: string]: string} = {};
	if (!source) return result;
	source.replace('?', '').replace(/([^\&]*?)=([^&]*)/g, (_, k, v) => {
		result[k] = v;
		return '';
	});
	return result as T;
};