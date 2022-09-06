import { accountStore } from "./appStore";
import { swapRouterAddress, web3, wPlugcnAddress } from "./backend-api";
import cosmo from 'cosmo-wallet-tool';
import { toolNumberDiv, toolNumberSplit } from "$tools";

// 执行代币流动池添加方法
export const dataSetLpPoolAddVolume = async (
	contracts: string[],
	volumes: string[],
	userAccount: string,
): Promise<string> => {
	let result: string = '';
	let raw = '';
	let volumePlug: string|undefined = undefined;
	if (contracts.filter(item => item === wPlugcnAddress).length) {
		let tokenContract = contracts[0];
		let tokenVolume = volumes[0];
		volumePlug = volumes[1];
		if (tokenContract === wPlugcnAddress) {
			tokenContract = contracts[1];
			tokenVolume = volumes[1];
			volumePlug = volumes[0];
		}
		raw = web3.eth.abi.encodeFunctionSignature('addLiquidityPLUG(address,uint256,uint256,uint256,address,uint256)') + 
					web3.utils.stripHexPrefix(
						web3.eth.abi.encodeParameters(
							['address', 'uint256', 'uint256', 'uint256', 'address', 'uint256'],
							[
								cosmo.addressForBech32ToHex(tokenContract),
								tokenVolume,
								toolNumberDiv(tokenVolume, '2', { places: 0 }), toolNumberDiv(volumePlug, '2', { places: 0 }),
								cosmo.addressForBech32ToHex(userAccount),
								(Math.floor(new Date().getTime() / 1000) + (10 * 60)).toString()
							]
						)
					);
	} else {
		raw = web3.eth.abi.encodeFunctionSignature('addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)') + 
					web3.utils.stripHexPrefix(
						web3.eth.abi.encodeParameters(
							['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'uint256'],
							[
								cosmo.addressForBech32ToHex(contracts[0]), cosmo.addressForBech32ToHex(contracts[1]),
								volumes[0], volumes[1],
								toolNumberDiv(volumes[0], '2', { places: 0 }), toolNumberDiv(volumes[1], '2', { places: 0 }),
								cosmo.addressForBech32ToHex(userAccount),
								(Math.floor(new Date().getTime() / 1000) + (10 * 60)).toString()
							]
						)
					);
	}
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractSendRaw(cosmo.addressForBech32ToHex(swapRouterAddress), raw, volumePlug ? parseFloat(volumePlug) : undefined)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractSend(cosmo.addressForBech32ToHex(swapRouterAddress), undefined, undefined, raw, volumePlug))?.data ?? '';
	}
	return typeof result === 'object' ? JSON.stringify(result) : result.toString();
};
// 执行v1流动池添加方法
export const dataSetLpPoolAddVolumeV1 = async (input: {
	poolId: number;
	fromSymbol: string;
	fromAmount: string;
	showFromAmount: string;
	toSymbol: string;
	showToAmount: string;
	toAmount: string;
	gasAll: string;
}) => {
	let result: any;
	if (await cosmo.isChrome) {
		result = await cosmo.chromeTool.dexMsgDepositWithinBatch(input.poolId as any, input.fromSymbol, input.showFromAmount as any, input.toSymbol, input.showToAmount as any);
	}
	if (await cosmo.isWallet) {
		result = await cosmo.walletTool.addLiquidity(input);
	}
	return result;
}
// 执行v1流动池创建方法
export const dataSetLpPoolCreateVolumeV1 = async (input: {
	fromSymbol: string;
	fromAmount: string;
	showFromAmount: string;
	toSymbol: string;
	showToAmount: string;
	toAmount: string;
	gasAll: string;
}) => {
	let result: any;
	if (await cosmo.isChrome) {
		result = await cosmo.chromeTool.dexMsgCreatePool(input.fromSymbol, input.showFromAmount as any, input.toSymbol, input.showToAmount as any);
	}
	if (await cosmo.isWallet) {
		result = await cosmo.walletTool.createLiquidity(input);
	}
	return result;
}

// 获取lp持有量
export const dataGetLpPoolDidVolume = async (contract: string, userAccount: string): Promise<string|undefined> => {
	let result: string = '';
	let raw = '';
	raw = web3.eth.abi.encodeFunctionSignature('balanceOf(address)') + 
				web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['address'], [cosmo.addressForBech32ToHex(userAccount)]));
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(contract, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(contract, undefined, undefined, raw))?.data ?? '';
	}
	return BigInt(result).toString();
};

// 获取lp总量
export const dataGetLpPoolTotalVolume = async (contract: string): Promise<string|undefined> => {
	let result: string = '';
	let raw = '';
	raw = web3.eth.abi.encodeFunctionSignature('totalSupply()');
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(contract, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(contract, undefined, undefined, raw))?.data ?? '';
	}
	return BigInt(result).toString();
}

// 移除lp代币
export const dataSetRemoveLpVolume = async (contracts: string[], lpVolume: string, volumes: string[], userAccount: string) => {
	let result: string = '';
	let raw = '';
	let volumePlug: string|undefined = undefined;
	if (contracts.filter(item => item === wPlugcnAddress).length) {
		let tokenContract = contracts[0];
		let tokenVolume = volumes[0];
		volumePlug = volumes[1];
		if (tokenContract === wPlugcnAddress) {
			tokenContract = contracts[1];
			tokenVolume = volumes[1];
			volumePlug = volumes[0];
		}
		raw = web3.eth.abi.encodeFunctionSignature('removeLiquidityPLUG(address,uint256,uint256,uint256,address,uint256)') + 
					web3.utils.stripHexPrefix(
						web3.eth.abi.encodeParameters(
							['address', 'uint256', 'uint256', 'uint256', 'address', 'uint256'],
							[
								cosmo.addressForBech32ToHex(tokenContract),
								lpVolume,
								toolNumberSplit(tokenVolume, 0), toolNumberSplit(volumePlug, 0),
								cosmo.addressForBech32ToHex(userAccount),
								(Math.floor(new Date().getTime() / 1000) + (10 * 60)).toString()
							]
						)
					);
	} else {
		raw = web3.eth.abi.encodeFunctionSignature('removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)') + 
					web3.utils.stripHexPrefix(
						web3.eth.abi.encodeParameters(
							['address', 'address', 'uint256', 'uint256', 'uint256', 'address', 'uint256'],
							[
								cosmo.addressForBech32ToHex(contracts[0]), cosmo.addressForBech32ToHex(contracts[1]),
								lpVolume,
								volumes[0], volumes[1],
								cosmo.addressForBech32ToHex(userAccount),
								(Math.floor(new Date().getTime() / 1000) + (10 * 60)).toString()
							]
						)
					);
	}
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractSendRaw(cosmo.addressForBech32ToHex(swapRouterAddress), raw)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractSend(cosmo.addressForBech32ToHex(swapRouterAddress), undefined, undefined, raw))?.data ?? '';
	}
	return typeof result === 'object' ? JSON.stringify(result) : result.toString();
}

// 移除lp代币
export const dataSetRemoveLpVolumeV1 = async (poolId: number, lpSymbol: string, lpAmount: string) => {
	let result: any;
	if (accountStore.value.isWeb) {
		result = await cosmo.chromeTool.dexMsgWithdrawWithinBatch(poolId as any, lpSymbol, lpAmount as any);
	}
	if (accountStore.value.isWallet) {
		result = await cosmo.walletTool.removeLiquidity({ poolId, fromSymbol: lpSymbol, fromAmount: lpAmount, gasAll: '200' });
	}
	return result;
};