import { accountStoreInit } from './../database/appStore';
import cosmo from 'cosmo-wallet-tool';
// 需要的权限类型
const needPermission = [
	'accountAddress', 'accountAddressType', 'contractCall', 'tokenTransferSend', 'contractSend', 'liquidity'
];

// 判断钱包类型
export const toolCheckWalletType = async (): Promise<'wallet'|'web'|null> => {
	let result: 'wallet'|'web'|null = null;
	if (await cosmo.isChrome) result = 'web';
	else if (await cosmo.isWallet) result = 'wallet';
	return result;
};
// 连接钱包
export const toolLinkWallet = async (init: boolean = false): Promise<typeof accountStoreInit | null> => {
	const deviceType = await toolCheckWalletType();
	if (deviceType === null) return null;
	// 判断权限
	const permission = await cosmo.getPermission();
	if (permission === null || (permission.length < needPermission.length && permission[0] !== '*')) {
		if (init) return null;
		// 申请权限
		const permissionResult = await cosmo.applyPermission();
		if (permissionResult === null) return null;
	}
	const accountType = await cosmo.getAccountType();
	const accountAddress = await cosmo.getAccount();
	if (!accountAddress) return null;
	if (!accountType) return null;
	return {
		isWallet: deviceType === 'wallet',
		isWeb: deviceType === 'web',
		accountAddress: accountAddress,
		accountType: accountType === 'PRC20' ? 'PRC20' : 'PRC10'
	};
};
