import { FC, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ComponentContentBox, ComponentLayoutLoading } from '$components';
import { useTranslation } from 'react-i18next';

import './index.scss';
import { dataGetAccountTokenBalance, dataGetAllowVolume, dataGetLpContractAddress, dataGetLpPoolDidVolume, dataGetLpPoolTotalVolume, dataGetLpPoolVolume, dataSearchToken, dataSetApprove, dataSetLpPoolAddVolume, InEvmBalanceToken } from '$database';
import ComponentSwapInputBox from '$components/functional/swap-input-box';
import { layoutModalShow } from '$database/layout-data';
import { ComModalSelectToken } from '$components/functional/modal-select-token';
import { ComponentSlippage } from '$components/functional/slippage';
import { toolNumberAdd, toolNumberDiv, toolNumberMul, toolNumberSplit, toolNumberStrToFloatForInt, toolNumberStrToIntForFloat, toolNumberToPercentage } from '$tools';
import { useCustomFormatSearch, useCustomGetAccountAddress } from '$hooks';
import { toast } from 'react-toastify';
import ComLayoutShadowGlass from '$components/layout/shadow-glass';

const PagePoolsAdd: FC = () => {
	const { t } = useTranslation();
	// 账户地址
	const { accountAddress } = useCustomGetAccountAddress();
	const search = useCustomFormatSearch<{one?: string, two?: string}>();
	// from支付数量
	const [fromVolume, setFromVolume] = useState('0.0');
	// to支付数量
	const [toVolume, setToVolume] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// 已有from币池子数量
	const [ fromPoolTokenVolume, setFromPoolTokenVolume ] = useState<string|null>(null);
	// 已有to币池子数量
	const [ toPoolTokenVolume, setToPoolTokenVolume ] = useState<string|null>(null);
	// 1from兑换to比例
	const [ oneFromTransTo, setOneFromTransTo ] = useState<string>('-');
	// 1to兑换from比例
	const [ oneToTransFrom, setOneToTransFrom ] = useState<string>('-');
	// 新增后资金池比例
	const [ addedScale, setAddedScale ] = useState<string>('-');
	// 已有仓位数据
	const [ holderData, setHolderData ] = useState<null|{ from: string, to: string, scale: string }>(null);
	// 显示loading
	const [ loading, setLoading ] = useState(false);
	// lp地址
	const [ lpContractAddress, setLpContractAddress ] = useState<string>();
	// lp 总量
	const [ lpTotalVolume, setLpTotalVolume ] = useState<string>();
	// 用户持有lp数量
	const [ lpUserVolume, setLpUserVolume ] = useState<string>();
	// 是否符合添加
	const [ canAdd, setCanAdd ]  = useState<boolean>(false);
	// 是否需要授权
	const [needApproveFrom, setNeedApproveFrom] = useState<boolean>();
	const [needApproveTo, setNeedApproveTo] = useState<boolean>();
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
				setFromVolume('0');
				setToVolume('0');
			}} filterContractArr={[
				fromTokenInfo?.contractAddress??'',
				toTokenInfo?.contractAddress??'',
			]}></ComModalSelectToken>,
			options: {
				title: t('选择代币'),
			}
		});
	};
	// 添加流动池
	const addPools = async () => {
		if (needApproveFrom || needApproveTo) return approve();
		if (!accountAddress) return;
		if (!(parseFloat(fromVolume) > 0)) return;
		setLoading(true);
		try {
			toast.info(t('将进行代币兑换'));
			const result = await dataSetLpPoolAddVolume(
				[fromTokenInfo?.contractAddress??'', toTokenInfo?.contractAddress??''],
				[toolNumberStrToIntForFloat(fromVolume, fromTokenInfo?.scale??0), toolNumberStrToIntForFloat(toVolume, toTokenInfo?.scale??0)],
				accountAddress ?? '',
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
		const contractAddress = (needApproveFrom ? fromTokenInfo?.contractAddress : toTokenInfo?.contractAddress) ?? '';
		try {
			toast.info(t('请进行代币授权'));
			const result = await dataSetApprove(contractAddress);
			if (result) {
				toast(t('授权成功'), { type: 'success' });
				setNeedApproveFrom(false);
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
		const res = await dataGetLpPoolDidVolume(lpContractAddress??'', accountAddress??'');
		if (res) setLpUserVolume(res);
		else setLpUserVolume('0');
	};

	// 获取头部信息
	useEffect(() => {
		if (search?.one && search?.two && accountAddress) {
			// 搜索代币信息
			setLoading(true);
			Promise.all([
				dataSearchToken(search.one),
				dataSearchToken(search.two),
				dataGetAccountTokenBalance(accountAddress, [search.one??'', search.two??''])
			]).then(([one, two, balances]) => {
				if (!balances.data) return;
				if (one.status === 200 && one.data && one.data.length) {
					setFromTokenInfo({...one.data[0], balance: toolNumberStrToFloatForInt(balances.data[0], one.data[0].scale)});
				}
				if (two.status === 200 && two.data && two.data.length) {
					setToTokenInfo({...two.data[0], balance: toolNumberStrToFloatForInt(balances.data[1], two.data[0].scale)});
				}
				// 获取账户余额
			}).finally(() => {
				setLoading(false);
			});
		}
	}, [search, accountAddress]);

	// 获取lp地址
	useEffect(() => {
		if (!fromTokenInfo || !toTokenInfo) {
			setLpContractAddress(undefined);
			return;
		}
		(async () => {
			const result = await dataGetLpContractAddress(fromTokenInfo.contractAddress, toTokenInfo.contractAddress);
			if (result) {
				setLpContractAddress(result);
			}
		})();
	}, [fromTokenInfo, toTokenInfo]);
	// 获取合约内两个币种的余额
	useEffect(() => {
		if (!lpContractAddress || !fromTokenInfo || !toTokenInfo) return;
		(async () => {
			const result = await dataGetLpPoolVolume(lpContractAddress, [fromTokenInfo.contractAddress, toTokenInfo.contractAddress]);
			if (!result) return;
			setFromPoolTokenVolume(toolNumberStrToFloatForInt(result[0], fromTokenInfo.scale));
			setToPoolTokenVolume(toolNumberStrToFloatForInt(result[1], toTokenInfo.scale));
		})();
		(async () => {
			// 获取总量
			const totalRes = await dataGetLpPoolTotalVolume(lpContractAddress);
			if (!totalRes) return;
			setLpTotalVolume(totalRes);
		})();
	}, [lpContractAddress, fromTokenInfo, toTokenInfo]);
	// 获取用户持有信息
	useEffect(() => {
		if (!lpContractAddress || !accountAddress) return;
		(async () => {
			const result = await dataGetLpPoolDidVolume(lpContractAddress, accountAddress);
			if (result) setLpUserVolume(result);
			else setLpUserVolume('0');
		})();
	}, [ lpContractAddress, accountAddress]);
	// 设置币种增加比例
	useEffect(() => {
		if (!fromPoolTokenVolume || !toPoolTokenVolume) {
			setOneFromTransTo('0');
			setOneToTransFrom('0');
			return;
		}
		setOneFromTransTo(toolNumberDiv(toPoolTokenVolume, fromPoolTokenVolume));
		setOneToTransFrom(toolNumberDiv(fromPoolTokenVolume, toPoolTokenVolume));
	}, [fromPoolTokenVolume, toPoolTokenVolume]);
	// 监听输入框
	useEffect(() => {
		if (focusIndexRef.current !== 0) return;
		if (!oneFromTransTo) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		const value = parseFloat(fromVolume);
		if (!(value > 0)) {
			setToVolume('0');
			return;
		}
		setToVolume(toolNumberSplit(toolNumberMul(fromVolume, oneFromTransTo), toTokenInfo.scale));
	}, [fromVolume, fromTokenInfo, toTokenInfo, oneFromTransTo]);
	// 监听输出框
	useEffect(() => {
		if (focusIndexRef.current !== 1) return;
		if (!oneToTransFrom) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		const value = parseFloat(toVolume);
		if (!(value > 0)) {
			setFromVolume('0');
			return;
		}
		setFromVolume(toolNumberSplit(toolNumberMul(toVolume, oneToTransFrom), fromTokenInfo.scale));
	}, [toVolume, fromTokenInfo, toTokenInfo, oneToTransFrom]);
	// 计算资金池比例
	useEffect(() => {
		if (!fromVolume || !fromPoolTokenVolume) return;
		setAddedScale(
			toolNumberToPercentage(
				toolNumberDiv(
					fromVolume,
					toolNumberAdd(fromVolume, fromPoolTokenVolume)
				)
			)
		);
	}, [fromVolume, fromPoolTokenVolume]);
	// 是否可以添加
	useEffect(() => {
		if (!fromTokenInfo || !toTokenInfo) return;
		if (
			(parseFloat(fromVolume) <= parseFloat(fromTokenInfo.balance)) &&
			(parseFloat(toVolume) <= parseFloat(toTokenInfo.balance))
		) {
			setCanAdd(true);
		} else {
			setCanAdd(false);
		}
	}, [fromTokenInfo?.balance, toTokenInfo?.balance, fromVolume, toVolume]);
	// 获取授权判断
	useEffect(() => {
		if (!(parseFloat(fromVolume) > 0)) return;
		if (!fromTokenInfo || !accountAddress) return;
		if (!needApproveFrom) return;
		(async () => {
			// 判断授权
			const result = await dataGetAllowVolume(fromTokenInfo.contractAddress, accountAddress);
			if (BigInt(result) <= BigInt(toolNumberStrToIntForFloat(fromVolume, fromTokenInfo.scale))) {
				setNeedApproveFrom(true);
			} else {
				setNeedApproveFrom(false);
			}
		})();
	}, [fromVolume, fromTokenInfo?.contractAddress, accountAddress, needApproveFrom]);
	useEffect(() => {
		if (!(parseFloat(toVolume) > 0)) return;
		if (!toTokenInfo || !accountAddress) return;
		if (!needApproveTo) return;
		(async () => {
			// 判断授权
			const result = await dataGetAllowVolume(toTokenInfo.contractAddress, accountAddress);
			if (BigInt(result) <= BigInt(toolNumberStrToIntForFloat(toVolume, toTokenInfo.scale))) {
				setNeedApproveTo(true);
			} else {
				setNeedApproveTo(false);
			}
		})();
	}, [toVolume, toTokenInfo?.contractAddress, accountAddress, needApproveTo]);
	// 计算持有比例
	useEffect(() => {
		if (lpTotalVolume === undefined || lpUserVolume === undefined || fromPoolTokenVolume === null || toPoolTokenVolume === null) return;
		if (!fromTokenInfo || !toTokenInfo) return;
		// 百分比计算
		const scale = toolNumberDiv(BigInt(lpUserVolume).toString(), BigInt(lpTotalVolume).toString(), { places: 10 });
		// 计算
		const didFromVolume = toolNumberSplit(toolNumberMul(scale, fromPoolTokenVolume), fromTokenInfo.scale);
		const didToVolume = toolNumberSplit(toolNumberMul(scale, toPoolTokenVolume), toTokenInfo.scale);
		setHolderData({
			from: didFromVolume,
			to: didToVolume,
			scale: scale,
		});
	}, [lpTotalVolume, lpUserVolume, fromPoolTokenVolume, toPoolTokenVolume, fromTokenInfo, toTokenInfo]);

	return (
		<ComLayoutShadowGlass glass={accountAddress === undefined} className={classNames('page_pools_add')}>
			<ComponentLayoutLoading showLoading={loading}></ComponentLayoutLoading>
			<ComponentContentBox
				outerClass={classNames('pools_box_outer')}
				innerClass={classNames('pools_box_inner')}
				topChildren={
					<div className={classNames('pools_head')}>
						<h2 className={classNames('pools_title')}>{t('增加流动池')}</h2>
					</div>
				}>
				{/*  */}
				<div className={classNames('pools_add_inner')}>
					<div
						className={classNames('pools_add_box')}>
						<ComponentSwapInputBox
							buttonOnClick={canAdd ? addPools : undefined}
							buttonText={
								(fromTokenInfo && toTokenInfo) ?
								(
									needApproveFrom ? (t('授权代币') + ' ' + fromTokenInfo.symbol) : (
										needApproveTo ? (t('授权代币') + ' ' + toTokenInfo.symbol) : t('添加')
									)
								) :
								t('选择代币')}
							focusIndex={focusIndexRef}
							inputs={[
								{
									labelText: "输入",
									labelToken: fromTokenInfo,
									inputText: fromVolume,
									inputChange: setFromVolume,
									placeholder: "0.0",
									selectToken: () => onSelectToken('from'),
									key: 'pay_from',
									checkMax: true,
								},
								{
									labelText: "输入",
									labelToken: toTokenInfo,
									inputText: toVolume,
									inputChange: setToVolume,
									placeholder: "0.0",
									selectToken: () => onSelectToken('to'),
									key: 'pay_to',
									checkMax: true,
								}
							]} />
					</div>
					{/* 展示 */}
					{
						fromTokenInfo && toTokenInfo && (
							<div className={classNames('inner_info')}>
								<ComponentSlippage />
								<div className={classNames('inner_info_content')}>
									<div className={classNames('inner_info_line')}></div>
									<div className={classNames('inner_info_item')}>
										<p className={classNames('inner_info_value')}>{oneFromTransTo}</p>
										<p className={classNames('inner_info_desc')}>{toTokenInfo?.symbol} / {fromTokenInfo?.symbol}</p>
									</div>
									<div className={classNames('inner_info_item')}>
										<p className={classNames('inner_info_value')}>{oneToTransFrom}</p>
										<p className={classNames('inner_info_desc')}>{fromTokenInfo?.symbol} / {toTokenInfo?.symbol}</p>
									</div>
									<div className={classNames('inner_info_item')}>
										<p className={classNames('inner_info_value')}>{addedScale}</p>
										<p className={classNames('inner_info_desc')}>{t('资金池比例')}</p>
									</div>
								</div>
							</div>
						)
					}
				</div>
			</ComponentContentBox>
			{/* 您的仓位 */}
			{
				fromTokenInfo && toTokenInfo && (
					<div className={classNames('pools_add_hold')}>
						<div className={classNames('hold_head')}>
							<p className={classNames('hold_head_title')}>{t('您的仓位')}</p>
							<div className={classNames('hold_head_info')}>
								<img className={classNames('hold_head_logo')} src={fromTokenInfo.logo} alt={fromTokenInfo.symbol} />
								<img className={classNames('hold_head_logo')} src={toTokenInfo.logo} alt={toTokenInfo.symbol} />
								<p className={classNames('hold_head_symbol')}>
									{fromTokenInfo.symbol} / {toTokenInfo.symbol}
								</p>
							</div>
						</div>
						<div className={classNames('hold_content')}>
							<div className={classNames('hold_content_head')}>
								<p className={classNames('hold_content_title')}>{fromTokenInfo.symbol}</p>
								<p className={classNames('hold_content_title')}>{toTokenInfo.symbol}</p>
								<p className={classNames('hold_content_title')}>{t('资金池比例')}</p>
							</div>
							<div className={classNames('hold_content_info')}>
								<p className={classNames('hold_content_text')}>{holderData?.from??'-'}</p>
								<p className={classNames('hold_content_text')}>{holderData?.to??'-'}</p>
								<p className={classNames('hold_content_text')}>{toolNumberToPercentage(holderData?.scale??'0')}</p>
							</div>
							<ComponentLayoutLoading showLoading={holderData === null}></ComponentLayoutLoading>
						</div>
					</div>
				)
			}
		</ComLayoutShadowGlass>
	);
};

export default PagePoolsAdd;
