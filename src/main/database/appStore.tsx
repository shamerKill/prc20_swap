import { BehaviorSubject } from "rxjs";

export interface InEvmToken {
	symbol: string, // 代币单位
	contractAddress: string, // 合约地址,主链币为空字符串
	scale: number, // 小数点精度
	logo: string, // 图标
	minUnit: string, // 最小单位
};
export interface InEvmBalanceToken extends InEvmToken {
	balance: string, // 余额数量
}

// 判断是否已经连接账户
export const accountStoreInit: {
	// 是否是app钱包
	isWallet: boolean;
	// 是否是插件钱包
	isWeb: boolean;
	// 账户地址
	accountAddress?: string;
} = {
	isWallet: false,
	isWeb: false,
};
export const accountStore = new BehaviorSubject(accountStoreInit);

// 用户主链币余额
export const accountBalance: InEvmBalanceToken[] = [];
export const accountBalanceStore = new BehaviorSubject(accountBalance);

// 用户所选兑换代币
export const accountSwapSelectTokens: {
	from?: {
		balance: string, // 余额数量
	} & InEvmToken,
	to?: {
		balance: string, // 余额数量
	} & InEvmToken
} = {};
export const accountSwapSelectTokensStore = new BehaviorSubject(accountSwapSelectTokens);