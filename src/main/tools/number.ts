/** 除法 */
export function toolNumberDiv (divisor: string, dividend: string, options?: { places?: number}): string;
export function toolNumberDiv (divisor: number, dividend: number, options?: { places?: number}): number;
export function toolNumberDiv (divisor: BigInt, dividend: BigInt, options?: { places?: number}): BigInt;
export function toolNumberDiv (
	// 除数
	divisor: string|number|BigInt,
	// 被除数
	dividend: string|number|BigInt,
	options?: {
		// 小数点精度
		places?: number,
	}
): string|number|BigInt {
	if (divisor instanceof String) {
		return '';
	} else if (divisor instanceof Number) {
		return 0;
	} else {
		return BigInt(0);
	}
}