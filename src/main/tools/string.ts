
// 隐藏字符串中间
export const hideAddressCenter = (address: string, startLen = 8, endLen = 8) => {
	if (address.length < (startLen + endLen)) return address;
	const result: string = address.substring(0, startLen) + '...' + address.substring(address.length - 8);
	return result;
}