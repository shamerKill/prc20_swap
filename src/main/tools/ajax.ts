export const toolAjax = async <T>(url: string, option?: {
	method: 'GET' | 'POST';
	body?: any;
	type?: 'json'|'text';
}): Promise<T> => {
	return fetch(url, {
		method: option?.method, body: option?.body,
	}).then(data => {
		if (option?.type === 'json') return data.json();
		else return data.text();
	});
};

export const toolPost = async <T>(
	url: string, search?: { [key in string]: string|number|boolean }
): Promise<T> => {
	let fetchUrl = url;
	if (search) fetchUrl += '?' + Object.keys(search).map(key => `${key}=${search[key]}`).join('&');
	return toolAjax(fetchUrl, { method: 'POST' });
};

export const toolGet = async <T>(url: string, body: any): Promise<T> => {
	return toolAjax(url, { body, method: 'GET' });
};