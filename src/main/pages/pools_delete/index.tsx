import { ComponentContentBox, ComponentFunctionalButton, ComponentLayoutLoading } from '$components';
import ComFunctionSlider from '$components/functional/slider';
import { ComponentSlippage } from '$components/functional/slippage';
import ComLayoutShadowGlass from '$components/layout/shadow-glass';
import { dataGetAccountTokenBalance, dataGetAllowVolume, dataGetLpContractAddress, dataGetLpPoolDidVolume, dataGetLpPoolTotalVolume, dataGetLpPoolVolume, dataSearchToken, dataSetApprove, dataSetRemoveLpVolume, InEvmBalanceToken } from '$database';
import { useCustomFormatSearch, useCustomGetAccountAddress } from '$hooks';
import { toolNumberAdd, toolNumberDiv, toolNumberMul, toolNumberSplit, toolNumberStrToFloatForInt, toolNumberStrToIntForFloat, toolNumberToPercentage, toolPercentageToNumber } from '$tools';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import './index.scss';


const PagePoolsDelete: FC = () => {
	const { t } = useTranslation();
	// 账户地址
	const { accountAddress } = useCustomGetAccountAddress();
	const scaleItemList = ['0.25', '0.5', '0.75', '1'];
	const search = useCustomFormatSearch<{[key in 'one'|'two']?: string}>();
	// from支付数量
	const [fromVolume, setFromVolume] = useState('0.0');
	// to支付数量
	const [toVolume, setToVolume] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// 1from兑换to比例
	const [ oneFromTransTo, setOneFromTransTo ] = useState<string>('0.00');
	// 1to兑换from比例
	const [ oneToTransFrom, setOneToTransFrom ] = useState<string>('0.00');
	// 已有from币池子数量
	const [ fromPoolTokenVolume, setFromPoolTokenVolume ] = useState<string|null>(null);
	// 已有to币池子数量
	const [ toPoolTokenVolume, setToPoolTokenVolume ] = useState<string|null>(null);
	// 删除后资金池比例
	const [ deletedScale, setDeletedScale ] = useState<string>('0.00');
	// 已有仓位数据
	const [ holderData, setHolderData ] = useState<null|{ from: string, to: string, scale: string }>(null);
	// 显示loading
	const [ loading, setLoading ] = useState(false);
	// lp地址
	const [ lpContractAddress, setLpContractAddress ] = useState<string>();
	// 删除的比例
	const [ deleteScale, setDeleteScale ] = useState<string>('0');
	// lp 总量
	const [ lpTotalVolume, setLpTotalVolume ] = useState<string>();
	// 用户持有lp数量
	const [ lpUserVolume, setLpUserVolume ] = useState<string>();
	// 是否需要授权
	const [needApprove, setNeedApprove] = useState<boolean>();

	// 修改数量
	const onEditValue = (input: string) => {
		if (input === '') input = '0';
		const value = parseFloat(input);
		if (value <= 100 && value >= 0) setDeleteScale(toolPercentageToNumber(value.toFixed(1)));
		else if (value > 100) setDeleteScale('1');
		else if (value < 0) setDeleteScale('0');
		else setDeleteScale('0');
	};

	// 移除方法
	const onRemoveBtn = async () => {
		if (needApprove) return approve();
		if (!accountAddress) return;
		if (!(parseFloat(deleteScale) > 0)) return toast.warn(t('请选择数量'));
		if (!toTokenInfo || !fromTokenInfo) return;
		if (!lpUserVolume) return;
		setLoading(true);
		try {
			toast.info(t('将进行代币兑换'));
			const result = await dataSetRemoveLpVolume(
				[fromTokenInfo.contractAddress, toTokenInfo.contractAddress],
				toolNumberSplit(toolNumberMul(lpUserVolume, deleteScale), 0, true),
				[toolNumberStrToIntForFloat(fromVolume, fromTokenInfo.scale), toolNumberStrToIntForFloat(toVolume, toTokenInfo.scale)],
				accountAddress ?? '',
			);
			if (result.includes('status: true')) {
				toast.success(t('撤销成功'));
				await setTokenBalance();
				setDeleteScale('0');
			} else if (/^0x/.test(result)) {
				toast.info(t('交易已发送') + `\n(hash:${result})`);
				setDeleteScale('0');
				setTimeout(() => setTokenBalance(), 5000);
			} else {
				toast.warning(t('发送错误') + ': \n' + result);
			}
		} catch (e) {
			toast.warning(t('发送错误') + ': \n' + e);
		}
		setLoading(false);
	};
	// 获取授权信息
	const getApproveInfo = async () => {
		const result = await dataGetAllowVolume(lpContractAddress??'', accountAddress??'');
		if (BigInt(result) <= BigInt(lpTotalVolume??'0')) {
			setNeedApprove(true);
		} else {
			setNeedApprove(false);
		}
	};
	// 授权方法
	const approve = async () => {
		setLoading(true);
		try {
			toast.info(t('请进行代币授权'));
			const res = await dataSetApprove(lpContractAddress??'');
			if (res) {
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
	// 获取余额信息
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
				dataGetAccountTokenBalance(accountAddress, [search.one??'', search.two??'']),
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
	// 获取授权信息
	useEffect(() => {
		if (!lpContractAddress || !accountAddress || !lpTotalVolume) return;
		getApproveInfo();
	}, [lpContractAddress, accountAddress, lpTotalVolume]);

	// 设置持有
	useEffect(() => {
		setHolderData({from: '19', to: '1234.5', scale: '0.123'});
	}, [fromTokenInfo, toTokenInfo]);
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
	// 计算资金池比例
	useEffect(() => {
		if (!fromVolume || !fromPoolTokenVolume) return;
		setDeletedScale(
			toolNumberToPercentage(
				toolNumberDiv(
					fromVolume,
					toolNumberAdd(fromVolume, fromPoolTokenVolume)
				)
			)
		);
	}, [fromVolume, fromPoolTokenVolume]);
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
	// 设置币种池比例
	useEffect(() => {
		if (!fromPoolTokenVolume || !toPoolTokenVolume) {
			setOneFromTransTo('0');
			setOneToTransFrom('0');
			return;
		}
		setOneFromTransTo(toolNumberDiv(toPoolTokenVolume, fromPoolTokenVolume));
		setOneToTransFrom(toolNumberDiv(fromPoolTokenVolume, toPoolTokenVolume));
	}, [fromPoolTokenVolume, toPoolTokenVolume]);
	// 根据百分比设置数量
	useEffect(() => {
		if (!holderData?.from || !holderData?.to) return;
		if (!fromTokenInfo?.scale || !toTokenInfo?.scale) return;
		setFromVolume(
			toolNumberSplit(toolNumberMul(holderData.from, deleteScale), fromTokenInfo.scale)
		);
		setToVolume(
			toolNumberSplit(toolNumberMul(holderData.to, deleteScale), toTokenInfo.scale)
		);
	}, [deleteScale, holderData?.from, holderData?.to, fromTokenInfo?.scale, toTokenInfo?.scale]);


	return (
		<ComLayoutShadowGlass glass={accountAddress === undefined} className={classNames('page_pools_delete')}>
			<ComponentLayoutLoading showLoading={loading}></ComponentLayoutLoading>
			<ComponentContentBox
				outerClass={classNames('pools_box_outer')}
				innerClass={classNames('pools_box_inner')}
				topChildren={
					<div className={classNames('pools_head')}>
						<h2 className={classNames('pools_title')}>{t('增加流动池')}</h2>
					</div>
				}>
				{/* 删除 */}
				<div className={classNames('pools_delete_inner')}>
					<div className={classNames('pools_delete_box')}>
						<div className={classNames('pool_delete_top')}>
							<div className={classNames('pool_delete_num')}>
								<p className={classNames('pool_delete_num_text')}>{t('数量')}</p>
								<label className={classNames('pool_delete_num_label')} htmlFor="poolDeleteInput">
									<input
										id="poolDeleteInput"
										type="number"
										value={toolNumberToPercentage(deleteScale, false)}
										onChange={e => onEditValue(e.target.value)}
										className={classNames('pool_delete_num_input')} />
									<span className={classNames('pool_delete_num_unit')}>%</span>
								</label>
							</div>
							<div className={classNames('pool_delete_scale')}>
								<div className={classNames('delete_scale_list')}>
									{
										scaleItemList.map(item => (
											<ComponentFunctionalButton
												key={item}
												onClick={() => onEditValue(toolNumberToPercentage(item, false))}
												className={classNames('delete_scale_item', item === deleteScale && 'delete_scale_item_select')}>
												{item === '1' ? 'MAX' : toolNumberToPercentage(item)}
											</ComponentFunctionalButton>
										))
									}
								</div>
								<ComFunctionSlider
									value={parseFloat(toolNumberToPercentage(deleteScale, false))}
									onChange={value => setDeleteScale(toolPercentageToNumber(value.toString()))}></ComFunctionSlider>
							</div>
						</div>
						<div className={classNames('pool_delete_split')}>
							<i className={classNames('iconfont', 'icon-angle-double-down')}></i>
						</div>
						<div className={classNames('pool_delete_output')}>
							<div className={classNames('pool_output_item')}>
								<p className={classNames('pool_output_value')}>{fromVolume}</p>
								<div className={classNames('pool_output_coin')}>
									<img
										className={classNames('pool_output_coin_logo')}
										src={fromTokenInfo?.logo}
										alt={fromTokenInfo?.symbol} />
									<div className={classNames('pool_output_coin_symbol')}>{fromTokenInfo?.symbol}</div>
								</div>
							</div>
							<div className={classNames('pool_output_item')}>
								<p className={classNames('pool_output_value')}>{toVolume}</p>
								<div className={classNames('pool_output_coin')}>
									<img
										className={classNames('pool_output_coin_logo')}
										src={toTokenInfo?.logo}
										alt={toTokenInfo?.symbol} />
									<div className={classNames('pool_output_coin_symbol')}>{toTokenInfo?.symbol}</div>
								</div>
							</div>
						</div>
						<ComponentFunctionalButton
							className={classNames('pool_delete_btn')}
							onClick={loading ? undefined : onRemoveBtn}>
								{
									needApprove ? t('授权代币') : t('移除')
								}
						</ComponentFunctionalButton>
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
										<p className={classNames('inner_info_value')}>{deletedScale}</p>
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
					<div className={classNames('pools_delete_hold')}>
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

export default PagePoolsDelete;
