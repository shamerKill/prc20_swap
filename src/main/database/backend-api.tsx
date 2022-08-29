import cosmo from 'cosmo-wallet-tool';
import Web3  from 'web3';
import { toolApi, toolGet, toolReadUTF, toolWriteUTF } from "$tools";
import { accountStore, InEvmToken, InSwapPoolInfo } from "./appStore";
import { dataBaseError, dataBaseResult, TypeDataBase } from "./error";
import { TypeAppVersion } from '$types';
export const web3 = new Web3();
export const swapRouterAddress = 'gx1xulgpeuajthdc52eyqhfpsrf8w3thu97lhguxs';
export const factoryAddress = 'gx18g7wv6uq6p08mkupr8j2cze8hhhz5twu0ml2cz';
export const wPlugcnAddress = 'gx1d2wdkrvdu4y8l9k8pv0hs4cyrc03emtda8zepz';

// get demo data
export const getDemoData = async (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() < 1) {
				resolve([
					'1',
					'2',
				]);
			} else {
				reject(dataBaseError('error'));
			}
		}, 0);
	});
};

// 获取代币列表核心代币
export const dataGetTokenCoreList = async (version: TypeAppVersion): Promise<TypeDataBase<InEvmToken[]>> => {
	return toolGet(toolApi('/exchange/choice'), { version })
		.then((data: any) => {
			if (data.errno !== 200) throw Error(data.errmsg);
			if (!data.data) return dataBaseResult([]);
			const result = data.data.map((item: { [key in 'name'|'logo'|'token'|'decimals']: string|number; }) => ({
				symbol: item.name,
				contractAddress: item.token,
				scale: item.decimals,
				logo: item.logo,
				minUnit: item.token,
			}));
			return dataBaseResult(result);
		})
		.catch(e => dataBaseError(e.toString()));
};

// 查询代币
export const dataSearchToken = async (searchText: string): Promise<TypeDataBase<InEvmToken[]>> => {
	return toolGet(toolApi('/exchange/query'), { name: searchText })
		.then((data: any) => {
			if (data.errno !== 200) throw Error(data.errmsg);
			let result: InEvmToken[] = [];
			if (data.data) {
				result = data.data.map((item: { [key in 'name'|'logo'|'token'|'decimals']: string|number; }) => ({
					symbol: item.name,
					contractAddress: item.token,
					scale: item.decimals,
					logo: item.logo,
					minUnit: item.token,
				}));
			}
			return dataBaseResult(result);
		})
		.catch(e => dataBaseError(e.toString()));
}

// 获取代币余额
export const dataGetAccountTokenBalance = async (accountAddress: string, contractAddressList: string[]): Promise<TypeDataBase<string[]>> => {
	return toolGet(toolApi('/exchange/coins'), { address: accountAddress, tokens: contractAddressList.join() })
		.then((data: any) => {
			if (data.errno !== 200) throw Error(data.errmsg);
			if (!data.data) return dataBaseResult([]);
			const result: string[] = data.data.map((item: any) => item.balance);
			return dataBaseResult(result);
		})
		.catch(e => dataBaseError(e.toString()));
}

// 获取本地代币列表
export const dataGetTokenLocalList = async (address: string, version: TypeAppVersion): Promise<InEvmToken[]> => {
	const localData = window.localStorage.getItem(`cosmo_swap_${address}_${version}`);
	if (localData == null) return [];
	else {
		const strData = toolReadUTF(
			localData.split('_')
			.map(item => parseInt(item))
		);
		return JSON.parse(strData);
	}
};
// 设置本地代币列表
export const dataSetTokenLocalList = async (token: InEvmToken[], address: string, version: TypeAppVersion): Promise<void> => {
	window.localStorage.setItem(`cosmo_swap_${address}_${version}`, toolWriteUTF(JSON.stringify(token)).join('_'));
};

// swap根据支付数量获取支出数量
export const swapGetAmountsOut = async (amountIn: string, path: string[]): Promise<string> => {
	const raw = web3.eth.abi.encodeFunctionSignature('getAmountsOut(uint256,address[])') + 
								web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['uint256', 'address[]'], [amountIn, path.map(item => cosmo.addressForBech32ToHex(item))]));
	let result: string = '0';
	if (accountStore.value.isWeb) {
		result = await cosmo.chromeTool.contractCallRaw(cosmo.addressForBech32ToHex(swapRouterAddress), raw, 0) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(cosmo.addressForBech32ToHex(swapRouterAddress), undefined, undefined, raw))?.data ?? '';
	}
	if (result !== '0x') result = web3.eth.abi.decodeParameter('uint256[]', result)[1];
	else result = '0';
	return result;
};
// 根据支出数量获取支付数量
export const swapGetAmountsIn = async (amountOut: string, path: string[]): Promise<string> => {
	const raw = web3.eth.abi.encodeFunctionSignature('getAmountsIn(uint256,address[])') +
								web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['uint256', 'address[]'], [amountOut, path.map(item => cosmo.addressForBech32ToHex(item))]));
	let result: string = '0';
	if (accountStore.value.isWeb) {
		result = await cosmo.chromeTool.contractCallRaw(cosmo.addressForBech32ToHex(swapRouterAddress), raw, 0) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(cosmo.addressForBech32ToHex(swapRouterAddress), undefined, undefined, raw))?.data ?? '';
	}
	if (result !== '0x') result = web3.eth.abi.decodeParameter('uint256[]', result)[0];
	else result = '0';
	return result;
};

// 获取本地兑换滑点/时间
export const dataGetLocalSlip = async (): Promise<number[]> => {
	const localData = window.localStorage.getItem(`cosmo_swap_slip`);
	if (localData === null) return [0.5, 10];
	return localData.split('-').map(item => parseFloat(item));
};
// 设置本地兑换滑点/时间
export const dataSetLocalSlip = async (slip: number, timer: number) => {
	window.localStorage.setItem(`cosmo_swap_slip`, `${slip}-${timer}`);
}

// 获取授权值判断
export const dataGetAllowVolume = async (contractAddress: string, accountAddress: string) => {
	if (contractAddress === wPlugcnAddress || contractAddress === cosmo.addressForBech32ToHex(wPlugcnAddress)) {
		return Promise.resolve(BigInt(web3.utils.padLeft('0x', 64, 'F')).toString());
	}
	const raw = web3.eth.abi.encodeFunctionSignature('allowance(address,address)') + 
								web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['address', 'address'], [cosmo.addressForBech32ToHex(accountAddress), cosmo.addressForBech32ToHex(swapRouterAddress)]));
	let result: string = '0';
	const contractAddr = /^0x/.test(contractAddress) ? contractAddress : cosmo.addressForBech32ToHex(contractAddress);
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(contractAddr, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(contractAddr, undefined, undefined, raw))?.data ?? '';
	}
	if (result !== '0x') result = BigInt(result).toString();
	return result;
};

// 进行授权
export const dataSetApprove = async (contractAddress: string) => {
	const value = web3.utils.padLeft('0x', 64, 'F');
	const raw = web3.eth.abi.encodeFunctionSignature('approve(address,uint256)') + 
								web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['address', 'uint256'], [cosmo.addressForBech32ToHex(swapRouterAddress), value]));
	let result: string = '0';
	const contractAddr = /^0x/.test(contractAddress) ? contractAddress : cosmo.addressForBech32ToHex(contractAddress);
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractSendRaw(contractAddr, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractSend(contractAddr, undefined, undefined, raw))?.data ?? '';
	}
	return result;
};

// 获取v1 lp
export const dataGetSwapLpV10 = async (tokenAddress: string[]): Promise<TypeDataBase<{'lp_id': number, 'token_0': {[key in 'name'|'num']: string}, 'token_1': {[key in 'name'|'num']: string}}>> => {
	return toolGet(toolApi('/exchange/lptoken'), { token1: tokenAddress[0], token2: tokenAddress[1] })
		.then((data: any) => {
			if (data.errno !== 200) throw Error(data.errmsg);
			return dataBaseResult(data.data);
		})
		.catch(e => dataBaseError(e.toString()));
	
}

// 获取兑换率影响
export const dataGetSwapEffect = async (fromContract: string, toContract: string): Promise<string[]|undefined> => {
	let result: string = '';
	// 获取lp地址
	let raw = web3.eth.abi.encodeFunctionSignature('getPair(address,address)') + 
								web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['address', 'address'], [cosmo.addressForBech32ToHex(fromContract), cosmo.addressForBech32ToHex(toContract)]));
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(cosmo.addressForBech32ToHex(factoryAddress), raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(cosmo.addressForBech32ToHex(factoryAddress), undefined, undefined, raw))?.data ?? '';
	}
	if (!result) return;
	const lpAddress = web3.eth.abi.decodeParameter('address', result) as unknown as string;
	// 是否反转lp结果
	const reserve = (BigInt(cosmo.addressForBech32ToHex(fromContract)) < BigInt(cosmo.addressForBech32ToHex(toContract))) ? false : true;
	// 获取池子余额
	result = '';
	raw = web3.eth.abi.encodeFunctionSignature('getReserves()');
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(lpAddress, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(lpAddress, undefined, undefined, raw))?.data ?? '';
	}
	if (!result) return;
	const resData = web3.eth.abi.decodeParameters(['uint112', 'uint112', 'uint32'], result);
	const resultArr = [resData[0], resData[1]];
	if (reserve) return resultArr.reverse();
	return resultArr;
};

// 进行兑换
export const dataSetTokenTransfer = async (
	userAddress: string, fromVolume: string, toVolume: string,
	fromContractAddress: string, toContractAddress: string, timer: string,
) => {
	let result: string = '';
	// 获取lp地址
	let raw = '';
	if (fromContractAddress === wPlugcnAddress) {
		raw = web3.eth.abi.encodeFunctionSignature('swapExactPLUGForTokens(uint256,address[],address,uint256)') + 
									web3.utils.stripHexPrefix(
										web3.eth.abi.encodeParameters(
											['uint256', 'address[]', 'address', 'uint256'],
											[
												toVolume,
												[ cosmo.addressForBech32ToHex(fromContractAddress), cosmo.addressForBech32ToHex(toContractAddress) ],
												cosmo.addressForBech32ToHex(userAddress),
												timer
											]
										)
									);
	} else if (toContractAddress === wPlugcnAddress) {
		raw = web3.eth.abi.encodeFunctionSignature('swapExactTokensForPLUG(uint256,uint256,address[],address,uint256)') + 
									web3.utils.stripHexPrefix(
										web3.eth.abi.encodeParameters(
											['uint256', 'uint256', 'address[]', 'address', 'uint256'],
											[
												fromVolume, toVolume,
												[ cosmo.addressForBech32ToHex(fromContractAddress), cosmo.addressForBech32ToHex(toContractAddress) ],
												cosmo.addressForBech32ToHex(userAddress),
												timer
											]
										)
									);
	} else {
		raw = web3.eth.abi.encodeFunctionSignature('swapExactTokensForTokens(uint256,uint256,address[],address,uint256)') + 
									web3.utils.stripHexPrefix(
										web3.eth.abi.encodeParameters(
											['uint256', 'uint256', 'address[]', 'address', 'uint256'],
											[
												fromVolume, toVolume,
												[ cosmo.addressForBech32ToHex(fromContractAddress), cosmo.addressForBech32ToHex(toContractAddress) ],
												cosmo.addressForBech32ToHex(userAddress),
												timer
											]
										)
									);
	}
	const exchangePlugVolume = (wPlugcnAddress === fromContractAddress) ? fromVolume : '0';
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractSendRaw(cosmo.addressForBech32ToHex(swapRouterAddress), raw, exchangePlugVolume as any)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractSend(cosmo.addressForBech32ToHex(swapRouterAddress), undefined, undefined, raw, exchangePlugVolume))?.data ?? '';
	}
	return typeof result === 'object' ? JSON.stringify(result) : result.toString();
};

// 获取lp合约地址
export const dataGetLpContractAddress = async (oneContract: string, twoContract: string): Promise<string|undefined> => {
	let result: string = '';
	// 获取lp地址
	let raw = web3.eth.abi.encodeFunctionSignature('getPair(address,address)') + 
		web3.utils.stripHexPrefix(web3.eth.abi.encodeParameters(['address', 'address'], [cosmo.addressForBech32ToHex(oneContract), cosmo.addressForBech32ToHex(twoContract)]));
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(cosmo.addressForBech32ToHex(factoryAddress), raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(cosmo.addressForBech32ToHex(factoryAddress), undefined, undefined, raw))?.data ?? '';
	}
	if (!result) return;
	const lpAddress = web3.eth.abi.decodeParameter('address', result) as unknown as string;
	return lpAddress;
};
// 获取lp池子余额
export const dataGetLpPoolVolume = async (lpContract: string, contracts: [string, string]): Promise<undefined|[string, string]> => {
	// 是否反转lp结果
	const reserve = (BigInt(cosmo.addressForBech32ToHex(contracts[0])) < BigInt(cosmo.addressForBech32ToHex(contracts[1]))) ? false : true;
	// 获取池子余额
	let result = '';
	const raw = web3.eth.abi.encodeFunctionSignature('getReserves()');
	if (accountStore.value.isWeb) {
		result = (await cosmo.chromeTool.contractCallRaw(lpContract, raw, 0)) ?? '';
	}
	if (accountStore.value.isWallet) {
		result = (await cosmo.walletTool.contractCall(lpContract, undefined, undefined, raw))?.data ?? '';
	}
	if (!result) return;
	const resData = web3.eth.abi.decodeParameters(['uint112', 'uint112'], result);
	let resultArr: [string, string] = [resData[0], resData[1]];
	if (reserve) resultArr = (resultArr.reverse() as [string, string]);
	return resultArr;
};



// 获取用户lp列表
export const dataGetAccountLpList = async (account: string): Promise<TypeDataBase<InSwapPoolInfo[]>> => {
	return toolGet(toolApi('/lpAmount/own'), { address: account })
		.then((data: any) => {
			if (data.errno !== 200) throw Error(data.errmsg);
			const result: InSwapPoolInfo[] = data.data.map((item: any) => ({
				id: item['contract_lp']['address'],
				tokenOne: {
					symbol: item['contract0']['name'],
					contractAddress: item['contract0']['address'],
					scale: item['contract0']['decimals'],
					logo: item['contract0']['logo'],
					balance: item['contract0']['balance'],
					minUnit: '',
				},
				tokenTwo: {
					symbol: item['contract1']['name'],
					contractAddress: item['contract1']['address'],
					scale: item['contract1']['decimals'],
					logo: item['contract1']['logo'],
					balance: item['contract1']['balance'],
					minUnit: '',
				},
				poolScale: item['proportion'].toString(),
			} as InSwapPoolInfo));
			return dataBaseResult(result);
		})
		.catch(e => dataBaseError(e.toString()));
};


// 判断是v1还是v2
export const dataGetAppVersion = async (): Promise<TypeAppVersion> => {
	const localData = window.localStorage.getItem(`cosmo_swap_version`);
	if (localData == null) return 'v2';
	else {
		if (localData === 'v1') return 'v1';
		else return 'v2';
	}
};

export const dataSetAppVersion = async (version: TypeAppVersion) => {
	window.localStorage.setItem(`cosmo_swap_version`, version);
}

// v1兑换代币
export const dataSetSwapV1 = async (data: {
	poolId: number; fromSymbol: string; fromAmount: string; toSymbol: string; feeAmount: string; orderPrice: number;
}) => {
	let result: any;
	if (await cosmo.isWallet) {
		result = await cosmo.walletTool.sendLiquidity({
			poolId: data.poolId,
			fromSymbol: data.fromSymbol,
			fromAmount: data.fromAmount,
			toSymbol: data.toSymbol,
			feeAmount: data.feeAmount,
			orderPrice: data.orderPrice,
			gasAll: '200'
		});
	}
	if (await cosmo.isChrome) {
		const hash = await cosmo.chromeTool.dexPoolExchange(
			data.poolId.toString(), data.fromSymbol, parseInt(data.fromAmount), data.toSymbol, data.feeAmount, data.orderPrice
		);
		result = hash;
	}
	return result;
};