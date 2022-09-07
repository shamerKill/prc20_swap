import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ComponentContentBox, ComponentFunctionalButton } from '$components';
import { toast } from 'react-toastify';

import './index.scss';
import { useTranslation } from 'react-i18next';
import { ComponentSlippage } from '$components/functional/slippage';
import { dataGetAccountTokenBalance, dataGetAllowVolume, dataGetLocalSlip, dataGetSwapEffect, dataGetSwapLpV10, dataSearchToken, dataSetApprove, dataSetLocalSlip, dataSetSwapV1, dataSetTokenTransfer, InEvmBalanceToken, swapGetAmountsOut } from '$database';
import { toolNumberAdd, toolNumberCut, toolNumberDiv, toolNumberMul, toolNumberSplit, toolNumberStrToFloatForInt, toolNumberStrToIntForFloat, toolNumberToPercentage } from '$tools';
import ComponentSwapInputBox from '$components/functional/swap-input-box';
import { layoutModalHide, layoutModalShow } from '$database/layout-data';
import { ComModalSelectToken } from '$components/functional/modal-select-token';
import ComLayoutShadowGlass from '$components/layout/shadow-glass';
import { useCustomFormatSearch, useCustomGetAccountAddress, useCustomGetAppVersion } from '$hooks';

const PageSwap: FC = () => {
	const [ appVersion ] = useCustomGetAppVersion();
	if (appVersion === 'v2') {
		return <PageSwapV20 />
	} else if (appVersion === 'v1') {
		return <PageSwapV10 />
	} else {
		return <></>
	}
};

const PageSwapV10: FC = () => {
	const {t} = useTranslation();
	// 账户地址
	const { accountAddress } = useCustomGetAccountAddress();
	// 支付数量
	const [fromVolume, setFromVolume] = useState('0.0');
	// 兑换出来的数量
	const [toVolume, setToVolume] = useState('0.0');
	// 支付手续费数量
	const [feeVolume, setFeeVolume] = useState('0.0');
	// 最小接受额
	const [minReceive, setMinReceive] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// 交易池内from币数量
	const [fromTokenVolume, setFromTokenVolume] = useState<string|null>(null);
	// 交易池内to币数量
	const [toTokenVolume, setToTokenVolume] = useState<string|null>(null);
	// 兑换代币比例展示
	const [ tokenSwapShow, setTokenSwapShow ] = useState<string>('');
	// 是否在loading
	const [ loading, setLoading ] = useState(false);
	// 是否无法兑换 /流动性不足
	const [canNotSwap, setCanNotSwap] = useState<boolean>(false);
	// lp id
	const [lpId, setLpId] = useState<number>();
	// 代币价格
	const [ orderPrice, setOrderPrice ] = useState<string>();
	// 获取焦点在第几个input
	const focusIndexRef = useRef<number>();

	// 兑换方法
	const onSwapButtonClick = async () => {
		// 授权方法
		if (!accountAddress) return;
		if (
			!(parseFloat(fromVolume) > 0) || !fromTokenInfo || !lpId || !toTokenInfo || !orderPrice
		) return;
		if (parseFloat(fromTokenInfo.balance) - parseFloat(fromVolume) < 0) {
			return toast.warn(t('余额不足'));
		}
		setLoading(true);
		try {
			const result = await dataSetSwapV1({
				poolId: lpId,
				fromSymbol: fromTokenInfo.minUnit,
				showFromAmount: fromVolume,
				fromAmount: toolNumberStrToIntForFloat(fromVolume, fromTokenInfo.scale),
				toSymbol: toTokenInfo.minUnit,
				orderPrice: parseFloat(orderPrice),
				feeAmount: toolNumberStrToIntForFloat(feeVolume, fromTokenInfo.scale),
			});
			if (typeof result === 'string') {
				toast.info(t('交易已发送' + ' hash: \n' + result), { delay: 0 });
				setFromVolume('0');
				setToVolume('0');
				setTimeout(() => setTokenBalance(), 5000);
			} else if (result?.status === 0 && result?.data?.result?.txs?.[0]?.tx_result?.code === 0) {
				await setTokenBalance();
				setFromVolume('0');
				setToVolume('0');
				toast.success(t('兑换成功'));
			} else {
				toast.warning(t('发送错误') + ': \n' + result);
			}
		} catch (e) {
			toast.warning(t('发送错误') + ': \n' + e);
		}
		setLoading(false);
	};
	// 获取代币余额
	const setTokenBalance = async () => {
		const result = await dataGetAccountTokenBalance(accountAddress??'', [ fromTokenInfo?.contractAddress??'', toTokenInfo?.contractAddress??'' ]);
		if (result.status === 200 && result.data) {
			setFromTokenInfo(state => state ? {...state, balance: toolNumberStrToFloatForInt(result?.data?.[0]??'', fromTokenInfo?.scale??0)} : state );
			setToTokenInfo(state => state ? {...state, balance: toolNumberStrToFloatForInt(result?.data?.[1]??'', toTokenInfo?.scale??0)} : state );
		}
	};

	// 选择代币
	const onSelectToken = (type: 'from' | 'to') => {
		layoutModalShow({
			children: <ComModalSelectToken onSelect={(data) => {
				if (type === 'from') {
					if (toTokenInfo?.contractAddress === data.contractAddress) setToTokenInfo(null);
					setFromTokenInfo(data);
				}
				else if (type === 'to') {
					if (fromTokenInfo?.contractAddress === data.contractAddress) setFromTokenInfo(null);
					setToTokenInfo(data);
				}
				setToVolume('0');
				setToTokenVolume('0');
				setFromVolume('0');
				setFromTokenVolume('0');
				setFeeVolume('0.0');
				setMinReceive('0.0');
			}} filterContractArr={[
				fromTokenInfo?.contractAddress ?? '',
				toTokenInfo?.contractAddress ?? '',
			]}></ComModalSelectToken>,
			options: {
				title: t('选择代币'),
			}
		});
	}
	// 判断是否有交易池
	useEffect(() => {
		if (!toTokenInfo || !fromTokenInfo) return;
		(async() => {
			setLoading(true);
			const result = await dataGetSwapLpV10([fromTokenInfo.minUnit, toTokenInfo.minUnit]);
			setLoading(false);
			if (!result) return;
			if (result.status !== 200 || !result.data) return setCanNotSwap(true);
			if (result.data.lp_id === 0) {
				return setCanNotSwap(true);
			}
			setLpId(result.data.lp_id);
			setCanNotSwap(false);
			const [fromPoolVolume, toPoolVolume] = [toolNumberStrToFloatForInt(result.data.token_0.num, fromTokenInfo.scale), toolNumberStrToFloatForInt(result.data.token_1.num, toTokenInfo.scale)];
			const divScale = toolNumberDiv(toPoolVolume, fromPoolVolume);
			setTokenSwapShow(`1 ${fromTokenInfo.symbol} ≈ ${divScale} ${toTokenInfo.symbol}`);
			setFromTokenVolume(fromPoolVolume);
			setToTokenVolume(toPoolVolume);
		})();
	}, [toTokenInfo, fromTokenInfo]);
	// 监听支付输入框
	useEffect(() => {
		if (focusIndexRef.current !== 0) return;
		if (!fromTokenInfo || !toTokenInfo || !fromTokenVolume || !toTokenVolume) return;
		const value = parseFloat(fromVolume);
		if (!(value > 0)) {
			setToVolume('0');
			return;
		}
		// 获取手续费
		const fee = toolNumberSplit(toolNumberMul(toolNumberStrToIntForFloat(fromVolume, fromTokenInfo.scale), '0.0015'), 0, true);
		setFeeVolume(toolNumberStrToFloatForInt(fee, fromTokenInfo.scale));
		const _memTokenList = [fromTokenInfo, toTokenInfo].sort((a, b) => Number((a.minUnit as any) > (b.minUnit as any)) - 1);
		const _memFromToken = _memTokenList[0];
		const _memToToken = _memTokenList[1];
    let _memFromTokenVolumeWithDex = fromTokenVolume;
    let _memToTokenVolumeWithDex = toTokenVolume;
    let _memFromValue = fromVolume;
    let _memToValue = '0';
    if (_memFromToken.minUnit != fromTokenInfo.minUnit) {
      _memFromTokenVolumeWithDex = toTokenVolume;
      _memToTokenVolumeWithDex = fromTokenVolume;
      _memFromValue = '0';
      _memToValue = fromVolume;
    }
    // 代币价格
		const tokenOrderPrice = toolNumberDiv(
			// 需要作为标的物的代币
			toolNumberAdd(
				toolNumberStrToIntForFloat(_memFromTokenVolumeWithDex, _memFromToken.scale),
				toolNumberMul(toolNumberStrToIntForFloat(_memFromValue, _memFromToken.scale), '2')
			),
			// 需要求价格的代币
			toolNumberAdd(
				toolNumberStrToIntForFloat(_memToTokenVolumeWithDex, _memToToken.scale),
				toolNumberMul(toolNumberStrToIntForFloat(_memToValue, _memToToken.scale), '2')
			),
			{
				places: 20
			}
		);
		setOrderPrice(tokenOrderPrice);
		// 可以兑换的数据
		let canGetVolume: string;
		if (_memFromToken.minUnit === fromTokenInfo.minUnit) {
			canGetVolume = toolNumberStrToFloatForInt(
				toolNumberSplit(
					toolNumberDiv(
						toolNumberCut(
							toolNumberStrToIntForFloat(
								fromVolume, fromTokenInfo.scale
							),
							fee
						),
						tokenOrderPrice
					),
					0
				),
				toTokenInfo.scale
			);
		} else {
			canGetVolume = toolNumberStrToFloatForInt(
				toolNumberSplit(
					toolNumberMul(
						toolNumberCut(
							toolNumberStrToIntForFloat(
								fromVolume, fromTokenInfo.scale
							),
							fee
						),
						tokenOrderPrice
					),
					0
				),
				toTokenInfo.scale
			);
		}
		setToVolume(canGetVolume);
	}, [fromVolume, fromTokenInfo, toTokenInfo, fromTokenVolume, toTokenVolume]);
	// 监听兑换输入框
	useEffect(() => {
		if (focusIndexRef.current !== 1) return;
		if (!fromTokenInfo || !toTokenInfo || !fromTokenVolume || !toTokenVolume) return;
		const value = parseFloat(toVolume);
		if (!(value > 0)) {
			setFromVolume('0');
			return;
		}
		const _memTokenList = [fromTokenInfo, toTokenInfo].sort((a, b) => Number((a.minUnit as any) > (b.minUnit as any)) - 1);
		const _memFromToken = _memTokenList[0];
		const _memToToken = _memTokenList[1];
    let _memFromTokenVolumeWithDex = fromTokenVolume;
    let _memToTokenVolumeWithDex = toTokenVolume;
    let _memFromValue = fromVolume;
    let _memToValue = '0';
    if (_memFromToken.minUnit != fromTokenInfo.minUnit) {
      _memFromTokenVolumeWithDex = toTokenVolume;
      _memToTokenVolumeWithDex = fromTokenVolume;
      _memFromValue = '0';
      _memToValue = fromVolume;
    }
    // 代币价格
		const tokenOrderPrice = toolNumberDiv(
			// 需要作为标的物的代币
			toolNumberAdd(
				toolNumberStrToIntForFloat(_memFromTokenVolumeWithDex, _memFromToken.scale),
				toolNumberMul(toolNumberStrToIntForFloat(_memFromValue, _memFromToken.scale), '2')
			),
			// 需要求价格的代币
			toolNumberAdd(
				toolNumberStrToIntForFloat(_memToTokenVolumeWithDex, _memToToken.scale),
				toolNumberMul(toolNumberStrToIntForFloat(_memToValue, _memToToken.scale), '2')
			),
			{
				places: 20
			}
		);
		setOrderPrice(tokenOrderPrice);
		// 需要支付的数据
		let needGetVolume: string;
		if (_memFromToken.minUnit === fromTokenInfo.minUnit) {
			needGetVolume = toolNumberSplit(
				toolNumberMul(
					toolNumberStrToIntForFloat(
						toVolume, toTokenInfo.scale
					),
					tokenOrderPrice
				),
				0,
				true,
			);
		} else {
			needGetVolume = toolNumberSplit(
				toolNumberDiv(
					toolNumberStrToIntForFloat(
						toVolume, toTokenInfo.scale
					),
					tokenOrderPrice
				),
				0,
				true,
			);
		}
		needGetVolume = toolNumberDiv(needGetVolume, '0.9985', { places: 0 });
		// 获取手续费
		const fee = toolNumberSplit(toolNumberMul(needGetVolume, '0.0015'), 0, true);
		setFeeVolume(toolNumberStrToFloatForInt(fee, fromTokenInfo.scale));
		setFromVolume(toolNumberStrToFloatForInt(toolNumberAdd(needGetVolume, fee), fromTokenInfo.scale));
	}, [toVolume, fromTokenInfo, toTokenInfo, fromTokenVolume, toTokenVolume]);

	return (
		<ComLayoutShadowGlass glass={accountAddress === undefined} className={classNames('page_swap')}>
			<ComponentContentBox
				topChildren={
					<div className={classNames('swap_head')}>
						<h2 className={classNames('swap_title')}>{t('swap')}</h2>
					</div>
				}
				innerClass={classNames('swap_inner')}>
				{/* 兑换操作 */}
				<div className={classNames('inner_functional')}>
					<ComponentSwapInputBox
						hintText={tokenSwapShow}
						focusIndex={focusIndexRef}
						loading={loading}
						buttonOnClick={(canNotSwap || (parseFloat(fromVolume) > parseFloat(fromTokenInfo?.balance??''))) ? undefined : () => {
							if (fromTokenInfo === null) return onSelectToken('from');
							if (toTokenInfo === null) return onSelectToken('to');
							onSwapButtonClick();
						}}
						buttonText={
							(fromTokenInfo === null || toTokenInfo === null) ? t('选择代币')
							: (
								canNotSwap ? t('流动性不足') : (
									(parseFloat(fromVolume) > parseFloat(fromTokenInfo.balance)) ? t('支付代币余额不足') : t('兑换')
								)
							)
						}
						inputs={[
							{
								labelText: t('支付'),
								labelToken: fromTokenInfo,
								inputText: fromVolume,
								inputChange: setFromVolume,
								placeholder: "0.0",
								selectToken: () => onSelectToken('from'),
								key: 'pay_from',
								checkMax: true,
							},
							{
								labelText: t('兑换'),
								labelToken: toTokenInfo,
								inputText: toVolume,
								inputChange: setToVolume,
								placeholder: "0.0",
								selectToken: () => onSelectToken('to'),
								key: 'pay_to',
							}
						]} />
				</div>
				{/* 展示 */}
				<div className={classNames('inner_info')}>
					<ComponentSlippage />
					<div className={classNames('inner_info_content')}>
						<div className={classNames('inner_info_line')}></div>
						<div className={classNames('inner_info_item')}>
							<p className={classNames('inner_info_value')}>{minReceive}</p>
							<p className={classNames('inner_info_desc')}>{t('最小接受额')}</p>
						</div>
						<div className={classNames('inner_info_item')}>
							<p className={classNames('inner_info_value')}>{feeVolume} {fromTokenInfo?.symbol}</p>
							<p className={classNames('inner_info_desc')}>{t('手续费消耗')}</p>
						</div>
					</div>
				</div>
			</ComponentContentBox>
		</ComLayoutShadowGlass>
	);
};

const PageSwapV20: FC = () => {
	const {t} = useTranslation();
	const [ appVersion ] = useCustomGetAppVersion();
	const search = useCustomFormatSearch<{one?: string, two?: string}>();
	// 支付数量
	const [fromVolume, setFromVolume] = useState('0.0');
	// 兑换出来的数量
	const [toVolume, setToVolume] = useState('0.0');
	// 兑换率影响
	const [swapRateParameter, setSwapRateParameter] = useState('0%');
	// 最小接受额
	const [minReceive, setMinReceive] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// 交易池内from币数量
	const [fromTokenVolume, setFromTokenVolume] = useState<string|null>(null);
	// 交易池内to币数量
	const [toTokenVolume, setToTokenVolume] = useState<string|null>(null);
	// 选择的滑点
	const [ selectSlip, setSelectSlip ] = useState<number>(); // 默认百分之零点五
	// 截止时间
	const [ stopTime, setStopTime ] = useState<number>();
	// 账户地址
	const { accountAddress } = useCustomGetAccountAddress();
	// 兑换代币比例展示
	const [ tokenSwapShow, setTokenSwapShow ] = useState<string>('');
	// 是否无法兑换 /流动性不足
	const [canNotSwap, setCanNotSwap] = useState<boolean>(false);
	// 是否需要授权
	const [needApprove, setNeedApprove] = useState<boolean>();
	// 是否在loading
	const [ loading, setLoading ] = useState(false);
	// 获取焦点在第几个input
	const focusIndexRef = useRef<number>();

	// 选择代币
	const onSelectToken = (type: 'from' | 'to') => {
		layoutModalShow({
			children: <ComModalSelectToken onSelect={(data) => {
				if (type === 'from') {
					if (toTokenInfo?.contractAddress === data.contractAddress) setToTokenInfo(null);
					setFromTokenInfo(data);
				}
				else if (type === 'to') {
					if (fromTokenInfo?.contractAddress === data.contractAddress) setFromTokenInfo(null);
					setToTokenInfo(data);
				}
				setToVolume('0');
				setToTokenVolume('0');
				setFromVolume('0');
				setFromTokenVolume('0');
				setSwapRateParameter('0.0');
				setMinReceive('0.0');
			}} filterContractArr={[
				fromTokenInfo?.contractAddress ?? '',
				toTokenInfo?.contractAddress ?? '',
			]}></ComModalSelectToken>,
			options: {
				title: t('选择代币'),
			}
		});
	}

	// 高级设置
	const onHighSetting = () => {
		layoutModalShow({
			children: (
				<HighSettingModal
					selectSlip={selectSlip||0}
					setSelectSlip={setSelectSlip}
					stopTime={stopTime||0}
					setStopTime={setStopTime}>
				</HighSettingModal>
			),
			options: {
				title: t('高级设置'),
			}
		});
	};
	
	// 兑换方法
	const onSwapButtonClick = async () => {
		// 授权方法
		if (needApprove) return approve();
		if (!accountAddress) return;
		if (!(parseFloat(fromVolume) > 0)) return;
		setLoading(true);
		try {
			toast.info(t('将进行代币兑换'));
			const result = await dataSetTokenTransfer(
				accountAddress ?? '',
				toolNumberStrToIntForFloat(fromVolume, fromTokenInfo?.scale??0),
				toolNumberStrToIntForFloat(toVolume, toTokenInfo?.scale??0),
				fromTokenInfo?.contractAddress??'',
				toTokenInfo?.contractAddress??'',
				(Math.floor(new Date().getTime() / 1000) + ((stopTime||0) * 60)).toString()
			);
			if (result.includes('status: true')) {
				toast.success(t('兑换成功'));
				await setTokenBalance();
				setFromVolume('0');
				setToVolume('0');
			} else if (/^0x/.test(result)) {
				toast.info(t('交易已发送') + `\n(hash:${result})`);
				setFromVolume('0');
				setToVolume('0');
				setTimeout(() => setTokenBalance(), 5000);
			} else {
				toast.warning(t('发送错误') + ': \n' + result);
			}
		} catch (e) {
			toast.warning(t('发送错误') + ': \n' + e);
		}
		setLoading(false);
	};
	// 授权方法
	const approve = async () => {
		setLoading(true);
		try {
			toast.info(t('请进行代币授权'));
			const result = await dataSetApprove(fromTokenInfo?.contractAddress??'');
			if (result) {
				toast(t('授权成功'), { type: 'success' });
				setNeedApprove(false);
			} else {
				toast(t('授权错误'), { type: 'warning' });
			}
		} catch (e: any) {
			if (/password/.test(e.toString())) {
				toast(t('密码输入错误'), { type: 'warning' });
			} else {
				toast(t('授权错误'), { type: 'warning' });
			}
		}
		setLoading(false);
	};
	// 获取代币余额
	const setTokenBalance = async () => {
		const result = await dataGetAccountTokenBalance(accountAddress??'', [ fromTokenInfo?.contractAddress??'', toTokenInfo?.contractAddress??'' ]);
		if (result.status === 200 && result.data) {
			setFromTokenInfo(state => state ? {...state, balance: toolNumberStrToFloatForInt(result?.data?.[0]??'', fromTokenInfo?.scale??0)} : state );
			setToTokenInfo(state => state ? {...state, balance: toolNumberStrToFloatForInt(result?.data?.[1]??'', toTokenInfo?.scale??0)} : state );
		}
	};


	// 获取头部信息
	useEffect(() => {
		if (!accountAddress) return;
		if (search?.one && search?.two) {
			// 搜索代币信息
			setLoading(true);
			Promise.all([
				dataSearchToken(search.one, 'v2'),
				dataSearchToken(search.two, 'v2'),
				dataGetAccountTokenBalance(accountAddress, [search.one??'', search.two??''])
			]).then(([one, two, balances]) => {
				if (!balances.data) return;
				if (one.status === 200 && one.data && one.data.length) {
					setFromTokenInfo({...one.data[0], balance: toolNumberStrToFloatForInt(balances.data[0], one.data[0].scale)});
				}
				if (two.status === 200 && two.data && two.data.length) {
					setToTokenInfo({...two.data[0], balance: toolNumberStrToFloatForInt(balances.data[1], two.data[0].scale)});
				}
			}).finally(() => {
				setLoading(false);
			});
		} else if (search?.one) {
			// 搜索代币信息
			setLoading(true);
			Promise.all([
				dataSearchToken(search.one, 'v2'),
				dataGetAccountTokenBalance(accountAddress, [search.one??''])
			]).then(([one, balances]) => {
				if (!balances.data) return;
				if (one.status === 200 && one.data && one.data.length) {
					setFromTokenInfo({...one.data[0], balance: toolNumberStrToFloatForInt(balances.data[0], one.data[0].scale)});
				}
			}).finally(() => {
				setLoading(false);
			});
		}
	}, [search, accountAddress]);
	// 监听支付输入框
	useEffect(() => {
		if (focusIndexRef.current !== 0) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		const value = parseFloat(fromVolume);
		if (!(value > 0)) {
			setToVolume('0');
			return;
		}
		// 获取兑换额度
		(async () => {
			const result = await swapGetAmountsOut(
				toolNumberStrToIntForFloat(fromVolume, fromTokenInfo?.scale??0),
				[
					fromTokenInfo?.contractAddress??'',
					toTokenInfo?.contractAddress??'',
				]
			);
			if (result === '0') {
				setCanNotSwap(true);
				setToVolume('0');
			}
			else setCanNotSwap(false);
			setToVolume(toolNumberStrToFloatForInt(result, toTokenInfo?.scale??0));
		})();
	}, [fromVolume, fromTokenInfo, toTokenInfo]);
	// 监听兑换输入框
	useEffect(() => {
		if (focusIndexRef.current !== 1) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		if (!selectSlip) return;
		const value = parseFloat(toVolume);
		if (!(value > 0)) {
			setFromVolume('0');
			return;
		}
		// 获取支付额度
		(async () => {
			const result = await swapGetAmountsOut(
				toolNumberStrToIntForFloat(toVolume, toTokenInfo?.scale??0),
				[
					toTokenInfo?.contractAddress??'',
					fromTokenInfo?.contractAddress??'',
				]
			);
			if (result === '0') {
				setCanNotSwap(true);
				setFromVolume('0');
			}
			else setCanNotSwap(false);
			setFromVolume(toolNumberStrToFloatForInt(result, fromTokenInfo?.scale??0));
		})();
	}, [toVolume, fromTokenInfo, toTokenInfo]);
	// 设置本地滑点/时间
	useEffect(() => {
		if (!selectSlip || !stopTime) return;
		dataSetLocalSlip(selectSlip, stopTime);
	}, [selectSlip, stopTime]);
	// 获取高级设置
	useEffect(() => {
		(async () => {
			const slipTimer = await dataGetLocalSlip();
			setSelectSlip(slipTimer[0]);
			setStopTime(slipTimer[1]);
		})();
	}, []);
	// 获取授权判断
	useEffect(() => {
		if (!(parseFloat(fromVolume) > 0)) return;
		if (!fromTokenInfo || !accountAddress) return;
		if (!needApprove) return;
		(async () => {
			// 判断授权
			const result = await dataGetAllowVolume(fromTokenInfo.contractAddress, accountAddress);
			if (BigInt(result) <= BigInt(toolNumberStrToIntForFloat(fromVolume, fromTokenInfo.scale))) {
				setNeedApprove(true);
			} else {
				setNeedApprove(false);
			}
		})();
	}, [fromVolume, fromTokenInfo?.contractAddress, accountAddress, needApprove]);
	// 获取最小接受额
	useEffect(() => {
		if (!selectSlip) return;
		if (!(parseFloat(toVolume) > 0)) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		const intVolume = toolNumberStrToIntForFloat(toVolume, toTokenInfo.scale);
		const minValue = BigInt(intVolume) * (BigInt(1000) - BigInt(selectSlip * 10)) / BigInt(1000);
		setMinReceive(toolNumberStrToFloatForInt(minValue.toString(), toTokenInfo.scale));
	}, [toVolume, selectSlip, fromTokenInfo, toTokenInfo]);
	// 获取兑换率影响
	useEffect(() => {
		if (!(toTokenInfo) || !(fromTokenInfo)) return;
		(async() => {
			const result = await dataGetSwapEffect(fromTokenInfo.contractAddress, toTokenInfo.contractAddress);
			if (!result) return;
			const [fromPoolVolume, toPoolVolume] = [toolNumberStrToFloatForInt(result[0], fromTokenInfo.scale), toolNumberStrToFloatForInt(result[1], toTokenInfo.scale)];
			const divScale = toolNumberDiv(toPoolVolume, fromPoolVolume);
			setTokenSwapShow(`1 ${fromTokenInfo.symbol} ≈ ${divScale} ${toTokenInfo.symbol}`);
			setFromTokenVolume(fromPoolVolume);
			setToTokenVolume(toPoolVolume);
		})();
	}, [toTokenInfo, fromTokenInfo]);
	// 计算兑换率影响
	useEffect(() => {
		if (!fromTokenVolume || !toTokenVolume || !fromVolume || !toVolume || !toTokenInfo || !fromTokenInfo) return;
		// 初始值
		const defaultScale = toolNumberDiv(toTokenVolume, fromTokenVolume, { places: 10 });
		// 更改值
		const exchangeScale = toolNumberDiv(
			toolNumberAdd(toTokenVolume, toVolume),
			toolNumberAdd(fromTokenVolume, fromVolume),
			{ places: 10 }
		);
		const moveScale = parseFloat(((parseFloat(exchangeScale) - parseFloat(defaultScale)) / parseFloat(defaultScale)).toFixed(4)) / 100;
		setSwapRateParameter(toolNumberToPercentage(moveScale));
	}, [fromTokenVolume, toTokenVolume, fromVolume, toVolume]);

	useEffect(() => {
		if (appVersion) {
			setFromTokenInfo(null);
			setToTokenInfo(null);
			setFromVolume('0');
			setToVolume('0');
			setMinReceive('0.0');
			setSwapRateParameter('0%');
		}
	}, [appVersion]);

	return (
		<ComLayoutShadowGlass glass={accountAddress === undefined} className={classNames('page_swap')}>
			<ComponentContentBox
				topChildren={
					<div className={classNames('swap_head')}>
						<h2 className={classNames('swap_title')}>{t('swap')}</h2>
						<ComponentFunctionalButton onClick={onHighSetting} className={classNames('swap_setting_btn')}>
							<i className='iconfont icon-shezhi'></i>
						</ComponentFunctionalButton>
					</div>
				}
				innerClass={classNames('swap_inner')}>
				{/* 兑换操作 */}
				<div className={classNames('inner_functional')}>
					<ComponentSwapInputBox
						hintText={tokenSwapShow}
						focusIndex={focusIndexRef}
						loading={loading}
						buttonOnClick={(canNotSwap || (parseFloat(fromVolume) > parseFloat(fromTokenInfo?.balance??''))) ? undefined : () => {
							if (fromTokenInfo === null) return onSelectToken('from');
							if (toTokenInfo === null) return onSelectToken('to');
							onSwapButtonClick();
						}}
						buttonText={
							(fromTokenInfo === null || toTokenInfo === null) ? t('选择代币')
							: (
								canNotSwap ? t('流动性不足') : (
									(parseFloat(fromVolume) > parseFloat(fromTokenInfo.balance)) ? t('支付代币余额不足') :
									(
										needApprove ? t('授权代币') :
										t('兑换')
									)
								)
							)
						}
						inputs={[
							{
								labelText: t('支付'),
								labelToken: fromTokenInfo,
								inputText: fromVolume,
								inputChange: setFromVolume,
								placeholder: "0.0",
								selectToken: () => onSelectToken('from'),
								key: 'pay_from',
								checkMax: true,
							},
							{
								labelText: t('兑换'),
								labelToken: toTokenInfo,
								inputText: toVolume,
								inputChange: setToVolume,
								placeholder: "0.0",
								selectToken: () => onSelectToken('to'),
								key: 'pay_to',
							}
						]} />
				</div>
				{/* 展示 */}
				<div className={classNames('inner_info')}>
					<ComponentSlippage />
					<div className={classNames('inner_info_content')}>
						<div className={classNames('inner_info_line')}></div>
						<div className={classNames('inner_info_item')}>
							<p className={classNames('inner_info_value')}>{minReceive}</p>
							<p className={classNames('inner_info_desc')}>{t('最小接受额')}</p>
						</div>
						<div className={classNames('inner_info_item')}>
							<p className={classNames('inner_info_value')}>{swapRateParameter}</p>
							<p className={classNames('inner_info_desc')}>{t('兑换率影响')}</p>
						</div>
					</div>
				</div>
			</ComponentContentBox>
		</ComLayoutShadowGlass>
	);
};

export default PageSwap;


// 高级设置组件
const HighSettingModal: FC<{
	selectSlip: number,
	setSelectSlip: Dispatch<SetStateAction<number|undefined>>,
	stopTime: number,
	setStopTime: Dispatch<SetStateAction<number|undefined>>,
	children?: ReactNode,
}> = ({
	selectSlip, setSelectSlip, stopTime, setStopTime
}) => {
	// 选择的滑点
	const [ selectSlipMem, setSelectSlipMem ] = useState<number>(selectSlip);
	// 截止时间
	const [ stopTimeMem, setStopTimeMem ] = useState<number>(stopTime);
	// 默认滑点列表
	const defaultSlipList = [ 0.001, 0.005, 0.01 ];
	const { t } = useTranslation();
	// 选择
	const onSlipClick = (target: number) => {
		setSelectSlipMem(parseFloat(toolNumberToPercentage(target.toString(), false)));
	};
	// 确认设置
	const onSubmit = () => {
		setSelectSlip(selectSlipMem);
		setStopTime(stopTimeMem);
		layoutModalHide();
	};

	return (
		<div className={classNames('page_swap_high_setting')}>
			<div className={classNames('high_setting_title')}>
				<p className={classNames('high_setting_label')}>
					{t('设置滑点容差')}
				</p>
				<button className={classNames('hight_setting_tip_btn', 'iconfont', 'icon-icon_wenti')}>
					<p className={classNames('height_setting_tip_text')}>
						{t('如果价格变动幅度超过此百分比，您的交易将退回。')}
					</p>
				</button>
			</div>
			<div className={classNames('setting_slip_list')}>
				{
					defaultSlipList.map(item => (
						<ComponentFunctionalButton
							key={item}
							className={classNames('setting_slip_item', (selectSlipMem.toString() == toolNumberToPercentage(item, false))&&'setting_slip_item_select' )}
							onClick={() => onSlipClick(item)}>
							{toolNumberToPercentage(item)}
						</ComponentFunctionalButton>
					))
				}
				<label htmlFor="highSettingSlip" className={classNames('setting_input_label')}>
					<input
						id="highSettingSlip"
						className={classNames('setting_input_input')}
						type="number"
						value={selectSlipMem}
						onChange={e => {
							let value = e.target.value === '' ? '0' : e.target.value;
							let valueArr = value.split('.');
							if (valueArr.length >= 2 && valueArr[1].length > 1) return;
							setSelectSlipMem(parseFloat(value));
						}} />
					<span className={classNames('setting_input_unit')}>%</span>
				</label>
			</div>
			{
				selectSlipMem <= parseFloat(toolNumberToPercentage(defaultSlipList[1], false)) && <p className={classNames('setting_slip_desc')}>{t('您设置的滑点容差较低，交易可能失败')}</p>
			}
			<div className={classNames('high_setting_title')}>
				<p className={classNames('high_setting_label')}>
					{t('截止时间')}
				</p>
			</div>
			<label htmlFor="highSettingTime" className={classNames('setting_input_label setting_time_label')}>
				<input
					id="highSettingTime"
					className={classNames('setting_input_input')}
					type="number"
					value={stopTimeMem.toString()}
					onChange={e => {
						let value = e.target.value === '' ? '0' : e.target.value;
						let valueArr = value.split('.');
						if (valueArr.length >= 2 && valueArr[1].length > 1) return;
						setStopTimeMem(parseFloat(value));
					}} />
				<span className={classNames('setting_input_unit')}>{t('分钟')}</span>
			</label>
			<ComponentFunctionalButton
				className={classNames('setting_button')}
				onClick={onSubmit}>
				{t('确认设置')}
			</ComponentFunctionalButton>
		</div>
	);
};

