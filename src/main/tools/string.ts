
// 隐藏字符串中间
export const toolHideAddressCenter = (address: string, startLen = 8, endLen = 8) => {
	if (address.length < (startLen + endLen)) return address;
	const result: string = address.substring(0, startLen) + '...' + address.substring(address.length - 8);
	return result;
}

// 将字符串格式化为UTF8编码的字节
export const toolWriteUTF = (str: string, isGetBytes = true) => {
	const back: number[] = [];
	let byteSize = 0;
	for (var i = 0; i < str.length; i++) {
			const code = str.codePointAt(i) as number;
			if (0x00 <= code && code <= 0x7f) {
						byteSize += 1;
						back.push(code);
			} else if (0x80 <= code && code <= 0x7ff) {
						byteSize += 2;
						back.push((192 | (31 & (code >> 6))));
						back.push((128 | (63 & code)))
			} else if ((0x800 <= code && code <= 0xd7ff) 
							|| (0xe000 <= code && code <= 0xffff)) {
						byteSize += 3;
						back.push((224 | (15 & (code >> 12))));
						back.push((128 | (63 & (code >> 6))));
						back.push((128 | (63 & code)))
			}else if((0x10000 <= code && code <= 0x10ffff)){
				byteSize+=4;
				back.push((240 | (7 & (code>>18))));
				back.push((128 | (63 & (code>>12))));
				back.push((128 | (63 & (code>>6))));
				back.push((128 | (63 & (code))));
			}
	 }
	 for (i = 0; i < back.length; i++) {
				back[i] &= 0xff;
	 }
	 if (isGetBytes) {
				return back
	 }
	 if (byteSize <= 0xff) {
				return [0, byteSize].concat(back);
	 } else {
				return [byteSize >> 8, byteSize & 0xff].concat(back);
		}
}
// 读取UTF8编码的字节，并专为Unicode的字符串
export const toolReadUTF = (arr: number[]) => {
	let UTF = '';
	for (var i = 0; i < arr.length; i++) {
			var one = arr[i].toString(2),
							v = one.match(/^1+?(?=0)/);
			if (v && one.length == 8) {
					var bytesLength = v[0].length;
					var store = arr[i].toString(2).slice(7 - bytesLength);
					for (var st = 1; st < bytesLength; st++) {
							store += arr[st + i].toString(2).slice(2)
					}
					UTF += String.fromCharCode(parseInt(store, 2));
					i += bytesLength - 1
			} else {
					UTF += String.fromCharCode(arr[i])
			}
	}
	return UTF
}