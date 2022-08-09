import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentContentBox, ComponentFunctionalButton, ComponentLayoutLoading } from '$components';
import { useTranslation } from 'react-i18next';

import './index.scss';
import { InEvmBalanceToken } from '$database';
import ComponentSwapInputBox from '$components/functional/swap-input-box';
import { layoutModalShow } from '$database/layout-data';
import { ComModalSelectToken } from '$components/functional/modal-select-token';
import { ComponentSlippage } from '$components/functional/slippage';
import { toolNumberToPercentage } from '$tools';
import { useCustomFormatSearch } from '$hooks';

const PagePoolsAdd: FC = () => {
	const { t } = useTranslation();
	const search = useCustomFormatSearch<{id?: string}>();
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
	// 新增后资金池比例
	const [ addedScale, setAddedScale ] = useState<string>('0.00');
	// 已有仓位数据
	const [ holderData, setHolderData ] = useState<null|{ from: string, to: string, scale: string }>(null);
	// 显示loading
	const [ showLoading, setShowLoading ] = useState(false);


	// 选择代币
	const onSelectToken = (type: 'from' | 'to') => {
		layoutModalShow({
			children: <ComModalSelectToken onSelect={(data) => {
				if (type === 'from') setFromTokenInfo(data);
				else if (type === 'to') setToTokenInfo(data);
			}}></ComModalSelectToken>,
			options: {
				title: t('选择代币'),
			}
		});
	};
	// 添加流动池
	const addPools = () => {
		setShowLoading(true);
		setTimeout(() => setShowLoading(false), 5000);
	};

	// 获取头部信息
	useEffect(() => {
		if (search?.id) {
			setFromTokenInfo({
				symbol: 'plugcn',
				contractAddress: '',
				scale: 1,
				logo: 'http://zh.plugchain.info/assets/logo/chain-logo-light.png',
				minUnit: '',
				balance: '100.4',
			});
			setToTokenInfo({
				symbol: 'ETH',
				contractAddress: '',
				scale: 1,
				logo: 'http://zh.plugchain.info/assets/logo/chain-logo-light.png',
				minUnit: '',
				balance: '100.4',
			});
		}
	}, [search]);

	// 设置持有
	useEffect(() => {
		setHolderData({from: '19', to: '1234.5', scale: '0.123'});
	}, [fromTokenInfo, toTokenInfo]);

	return (
		<div className={classNames('page_pools_add')}>
			<ComponentLayoutLoading showLoading={showLoading}></ComponentLayoutLoading>
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
							buttonOnClick={addPools}
							buttonText={(fromTokenInfo && toTokenInfo) ? t('添加') : t('选择代币')}
							inputs={[
								{
									labelText: "输入",
									labelToken: fromTokenInfo,
									inputText: fromVolume,
									inputChange: (event) => setFromVolume(event.target.value),
									placeholder: "0.0",
									selectToken: () => onSelectToken('from'),
									key: 'pay_from',
								},
								{
									labelText: "输入",
									labelToken: toTokenInfo,
									inputText: toVolume,
									inputChange: (event) => setToVolume(event.target.value),
									placeholder: "0.0",
									selectToken: () => onSelectToken('to'),
									key: 'pay_to',
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
		</div>
	);
};

export default PagePoolsAdd;
