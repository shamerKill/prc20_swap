import { BehaviorSubject } from "rxjs";

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