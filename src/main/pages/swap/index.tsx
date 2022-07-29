import { Dispatch, FC, MouseEvent, MouseEventHandler, ReactNode, SetStateAction, useEffect, useState } from 'react';
import classNames from 'classnames';
import { ComponentContentBox, ComponentFunctionalButton } from '$components';

import './index.scss';
import { useTranslation } from 'react-i18next';
import { ComponentSlippage } from '$components/functional/slippage';
import { InEvmBalanceToken } from '$database';
import { numberToPercentage } from '$tools';
import ComponentSwapInputBox from '$components/functional/swap-input-box';
import { layoutModalHide, layoutModalShow } from '$database/layout-data';
import ComponentLayoutRefresh from '$components/layout/refresh';

const PageSwap: FC = () => {
	const {t} = useTranslation();
	// 支付数量
	const [fromVolume, setFromVolume] = useState('0.0');
	// 兑换出来的数量
	const [toVolume, setToVolume] = useState('0.0');
	// 兑换率影响
	const [swapRateParameter, setSwapRateParameter] = useState('0.0');
	// 最小接受额
	const [minReceive, setMinReceive] = useState('0.0');
	// 网络费用
	const [netWorkFee, setNetWorkFee] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmBalanceToken|null>({
		symbol: 'plugcn',
		contractAddress: '',
		scale: 1,
		logo: 'http://zh.plugchain.info/assets/logo/chain-logo-light.png',
		minUnit: '',
		balance: '100.4',
	});
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmBalanceToken|null>(null);
	// 交易池内from币数量
	const [fromTokenVolume, setFromTokenVolume] = useState<String|null>(null);
	// 交易池内to币数量
	const [toTokenVolume, setToTokenVolume] = useState<String|null>(null);
	// 选择的滑点
	const [ selectSlip, setSelectSlip ] = useState<number>(0);
	// 截止时间
	const [ stopTime, setStopTime ] = useState<number>(0);

	// 选择代币
	const onSelectToken = (type: 'from' | 'to') => {
		layoutModalShow({
			children: <TokenSelectModal onSelect={(data) => {
				if (type === 'from') setFromTokenInfo(data);
				else if (type === 'to') setToTokenInfo(data);
			}}></TokenSelectModal>,
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
					selectSlip={selectSlip}
					setSelectSlip={setSelectSlip}
					stopTime={stopTime}
					setStopTime={setStopTime}>
				</HighSettingModal>
			),
			options: {
				title: t('高级设置'),
			}
		});
	};

	return (
		<div className={classNames('page_swap')}>
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
						hintText="1 PLUGCN = 0.004GG"
						buttonOnClick={() => console.log(213)}
						buttonText="选择代币"
						inputs={[
							{
								labelText: "支付",
								labelToken: fromTokenInfo,
								inputText: fromVolume,
								inputChange: (event) => setFromVolume(event.target.value),
								placeholder: "0.0",
								selectToken: () => onSelectToken('from'),
								key: 'pay_from',
							},
							{
								labelText: "兑换",
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
						<div className={classNames('inner_info_item')}>
							<p className={classNames('inner_info_value')}>{netWorkFee}</p>
							<p className={classNames('inner_info_desc')}>{t('网络费用')}</p>
						</div>
					</div>
				</div>
			</ComponentContentBox>
		</div>
	);
};

export default PageSwap;


// 高级设置组件
const HighSettingModal: FC<{
	selectSlip: number,
	setSelectSlip: Dispatch<SetStateAction<number>>,
	stopTime: number,
	setStopTime: Dispatch<SetStateAction<number>>,
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
		setSelectSlipMem(parseFloat(numberToPercentage(target.toString(), false)));
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
							className={classNames('setting_slip_item', (selectSlipMem.toString() == numberToPercentage(item, false))&&'setting_slip_item_select' )}
							onClick={() => onSlipClick(item)}>
							{numberToPercentage(item)}
						</ComponentFunctionalButton>
					))
				}
				<label htmlFor="highSettingSlip" className={classNames('setting_input_label')}>
					<input
						id="highSettingSlip"
						className={classNames('setting_input_input')}
						type="number"
						value={selectSlipMem}
						onChange={e => setSelectSlipMem(parseFloat(e.target.value === '' ? '0' : e.target.value))} />
					<span className={classNames('setting_input_unit')}>%</span>
				</label>
			</div>
			{
				selectSlipMem <= parseFloat(numberToPercentage(defaultSlipList[1], false)) && <p className={classNames('setting_slip_desc')}>{t('您设置的滑点容差较低，交易可能失败')}</p>
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
					onChange={e => setStopTimeMem(parseInt(e.target.value === '' ? '0' : e.target.value))} />
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

// 选择代币
const TokenSelectModal: FC<{
	onSelect: (data: InEvmBalanceToken) => void;
}> = ({ onSelect }) => {
	const {t} = useTranslation();
	const [ searchText, setSearchText ] = useState<string>('');
	const [ localTokenList, setLocalTokenList ] = useState<InEvmBalanceToken[]>([]);
	const [ remoteTokenList, setRemoteTokenList ] = useState<InEvmBalanceToken[]>([]);
	const [ loading, setLoading ] = useState<boolean>(false);
	// 是不是管理列表
	const [ adminPage, setAdminPage ] = useState<boolean>(false);
	// 删除提示显示
	const [ deleteTipShow, setDeleteTipShow ] = useState<boolean>(false);
	// 删除代币暂存
	const [ willDeleteToken, setWillDeleteToken ] = useState<InEvmBalanceToken>();

	// 加载更多方法
	const fetchMore = () => {
		const data: InEvmBalanceToken[] = [];
		for (let i = 0; i < 20; i++) {
			data.push({
				symbol: 'plugcn ' + Math.random(),
				contractAddress: '',
				scale: 1,
				logo: 'http://zh.plugchain.info/assets/logo/chain-logo-light.png',
				minUnit: '',
				balance: '100.4',
			});
		}
		setLocalTokenList(data);
		setRemoteTokenList(state => state.concat(data));
	};

	// 选择方法
	const onItemClick = (data: InEvmBalanceToken) => {
		onSelect(data);
		layoutModalHide();
	};
	// 添加本地
	const onItemAdd = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, item: InEvmBalanceToken) => {
		event.preventDefault();
		event.stopPropagation();
		console.log(item);
	}

	// 切换管理列表
	const onSwitchAdmin = () => setAdminPage(state => !state);

	// 移除代币提示
	const onDeleteTokenTip = (item?: InEvmBalanceToken) => {
		setWillDeleteToken(item);
		setDeleteTipShow(true);
	};
	// 移除代币
	const onDeleteToken = () => {
		setDeleteTipShow(false);
		if (willDeleteToken === undefined) {
			setLocalTokenList([]);
		} else {
			setLocalTokenList(state => state.filter(item => item.symbol !== willDeleteToken.symbol));
		}
	}

	// 获取数据
	useEffect(() => {
		fetchMore();
	}, []);

	// 监听搜索
	useEffect(() => {
		console.log(searchText);
	}, [searchText]);
	
	useEffect(() => {
		if (deleteTipShow === false) {
			setWillDeleteToken(undefined);
		}
	}, [deleteTipShow]);

	return (
		<div className={classNames('page_swap_token_select')}>
			<input
				className={classNames('token_select_input')}
				placeholder={t('搜索名称或粘贴地址')}
				type="text"
				value={searchText}
				onChange={e => setSearchText(e.target.value)} />
			{/* 代币选择列表 */}
			{
				!adminPage && (
					<>
						<ComponentLayoutRefresh
							className={classNames('token_select_list')}
							loadingHandler={fetchMore}
							loading={loading}>
							{
								localTokenList.map(item => (
									<div onClick={() => onItemClick(item)} className={classNames('token_select_item')} key={item.symbol + item.minUnit}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<p className={classNames('token_select_symbol')}>{item.symbol}</p>
										<p className={classNames('token_select_balance')}>{item.balance}</p>
									</div>
								))
							}
							{
								remoteTokenList.map(item => (
									<div onClick={() => onItemClick(item)} className={classNames('token_select_item')} key={item.symbol + item.minUnit}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<p className={classNames('token_select_symbol')}>{item.symbol}</p>
										<p className={classNames('token_select_balance')}>{item.balance}</p>
										<ComponentFunctionalButton
											onClick={e => onItemAdd(e, item)}
											className={classNames('token_select_add')}>
											{t('添加')}
										</ComponentFunctionalButton>
									</div>
								))
							}
						</ComponentLayoutRefresh>
						<ComponentFunctionalButton className={classNames('token_select_button')} onClick={onSwitchAdmin}>
							<i className={classNames('iconfont', 'icon-bianji')}></i>
							<span>{t('管理代币列表')}</span>
						</ComponentFunctionalButton>
					</>
				)
			}
			{/* 代币管理列表 */}
			{
				adminPage && (
					<>
						<div className={classNames('token_local_title')}>
							<ComponentFunctionalButton onClick={onSwitchAdmin} className={classNames('token_local_title_back')}>
								<i className={classNames('iconfont', 'icon-jiantou_xiangzuo')}></i>
							</ComponentFunctionalButton>
							<p className={classNames('token_local_title_text')}>
								{t('本地列表')}
							</p>
							<ComponentFunctionalButton onClick={() => onDeleteTokenTip()} className={classNames('token_local_title_clear')}>
								{t('全部清除')}
							</ComponentFunctionalButton>
						</div>
						<div className={classNames('token_local_list')}>
							{
								localTokenList.map(item => (
									<div className={classNames('token_select_item')} key={item.symbol + item.minUnit}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<p className={classNames('token_select_symbol')}>{item.symbol}</p>
										<ComponentFunctionalButton onClick={() => onDeleteTokenTip(item)} className={classNames('token_local_delete')}>
											<i className={classNames('iconfont', 'icon-shanchu')}></i>
										</ComponentFunctionalButton>
									</div>
								))
							}
						</div>
						<p className={classNames('token_select_button', 'token_local_tip')}>
							{t('提示：自定义代币信息会本地存储在您的浏览器中')}
						</p>
					</>
				)
			}
			{/* 删除提示 */}
			<div className={classNames('token_delete_tip', deleteTipShow && 'token_delete_tip_show')}>
				<p className={classNames('token_delete_text')}>{t('是否删除？')}</p>
				<div className={classNames('token_delete_buttons')}>
					<ComponentFunctionalButton className={classNames('token_delete_btn', 'token_delete_cancel')} onClick={() => setDeleteTipShow(false)}>{t('取消')}</ComponentFunctionalButton>
					<ComponentFunctionalButton className={classNames('token_delete_btn', 'token_delete_sure')} onClick={onDeleteToken}>{t('确定')}</ComponentFunctionalButton>
				</div>
			</div>
		</div>
	)
}
