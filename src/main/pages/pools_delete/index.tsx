import { ComponentContentBox, ComponentFunctionalButton, ComponentLayoutLoading } from '$components';
import ComFunctionSlider from '$components/functional/slider';
import { ComponentSlippage } from '$components/functional/slippage';
import ComponentSwapInputBox from '$components/functional/swap-input-box';
import { InEvmBalanceToken } from '$database';
import { useCustomFormatSearch } from '$hooks';
import { numberToPercentage, percentageToNumber } from '$tools';
import classNames from 'classnames';
import { FC, MouseEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './index.scss';


const PagePoolsDelete: FC = () => {
	const { t } = useTranslation();
	const scaleItemList = ['0.25', '0.5', '0.75', '1'];
	const search = useCustomFormatSearch<{id: string}>();
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
	// 删除后资金池比例
	const [ deletedScale, setDeletedScale ] = useState<string>('0.00');
	// 已有仓位数据
	const [ holderData, setHolderData ] = useState<null|{ from: string, to: string, scale: string }>(null);
	// 显示loading
	const [ showLoading, setShowLoading ] = useState(false);
	// 删除的比例
	const [ deleteScale, setDeleteScale ] = useState<string>('0');

	// 修改数量
	const onEditValue = (input: string) => {
		if (input === '') input = '0';
		const value = parseFloat(input);
		if (value <= 100 && value >= 0) setDeleteScale(percentageToNumber(value.toFixed(1)));
		else if (value > 100) setDeleteScale('1');
		else if (value < 0) setDeleteScale('0');
		else setDeleteScale('0');
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
		<div className={classNames('page_pools_delete')}>
			<ComponentLayoutLoading showLoading={showLoading}></ComponentLayoutLoading>
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
										value={numberToPercentage(deleteScale, false)}
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
												onClick={() => onEditValue(numberToPercentage(item, false))}
												className={classNames('delete_scale_item', item === deleteScale && 'delete_scale_item_select')}>
												{item === '1' ? 'MAX' : numberToPercentage(item)}
											</ComponentFunctionalButton>
										))
									}
								</div>
								<ComFunctionSlider
									value={parseFloat(numberToPercentage(deleteScale, false))}
									onChange={value => setDeleteScale(percentageToNumber(value.toString()))}></ComFunctionSlider>
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
						<ComponentFunctionalButton className={classNames('pool_delete_btn')}>
							{t('移除')}
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
								<p className={classNames('hold_content_text')}>{numberToPercentage(holderData?.scale??'0')}</p>
							</div>
							<ComponentLayoutLoading showLoading={holderData === null}></ComponentLayoutLoading>
						</div>
					</div>
				)
			}
		</div>
	);
};

export default PagePoolsDelete;
