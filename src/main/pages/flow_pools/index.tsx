import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ComponentContentBox, ComponentFunctionalButton } from '$components';

import './index.scss';

type TypeFlowPoolItem = {
	id: string;
	type: 'lockup'|'pledge'; // 锁仓/质押
	name: string; // 矿池名称
	did: boolean; // 是否已质押/锁仓
	profitMul: string; // 收益倍数
	profitScale: string; // 收益利率
	profitSymbol: string; // 挖矿奖励代币单位
	input?: string; // 已质押/锁仓的数量
	allProfitValue?: string; // 收益数量
	canGetProfitValue?: string; // 可获取收益数量
};

const defaultData: TypeFlowPoolItem[] = [
	{
		id: '1',
		type: 'lockup',
		name: 'USDT-PLUGCN LP',
		did: false,
		profitMul: '42x',
		profitScale: '34.43%',
		profitSymbol: 'PLUGCN',
	},
	{
		id: '2',
		type: 'pledge',
		name: 'USDT-PLUGCN LP',
		did: false,
		profitMul: '42x',
		profitScale: '34.43%',
		profitSymbol: 'PLUGCN',
	},
	{
		id: '3',
		type: 'lockup',
		name: 'USDT-PLUGCN LP',
		did: true,
		profitMul: '42x',
		profitScale: '34.43%',
		input: '1234.124',
		allProfitValue: '0.124',
		canGetProfitValue: '0.1',
		profitSymbol: 'USDT',
	},
	{
		id: '4',
		type: 'pledge',
		name: 'USDT-PLUGCN LP',
		did: true,
		profitMul: '42x',
		profitScale: '34.43%',
		input: '1234.124',
		allProfitValue: '0.124',
		canGetProfitValue: '0.1',
		profitSymbol: 'PLUGCN',
	}
];

const PageFlowPools: FC = () => {
	const { t } = useTranslation();

	// 总锁仓价值
	const [ allLockUpValue, setAllLockUpValue ] = useState<string>('0');
	// 总锁仓美元价值
	const [ allLockUpDollar, setAllLockUpDollar ] = useState<string>('0.00');
	// 列表tab类型
	const [ tabType, setTabType ] = useState<0|1|2>(0); // 全部/ 锁仓/质押
	
	// 列表数据
	const [ itemList, setItemList ] = useState<TypeFlowPoolItem[]>([]);

	// 切换tab
	const onTabSwitch = (item: typeof tabType) => setTabType(item);

	useEffect(() => {
		setItemList(defaultData.filter(item => {
			return (
				(tabType === 0) ||
				(tabType === 1 && item.type === 'lockup') ||
				(tabType === 2 && item.type === 'pledge')
			);
		}));
	}, [tabType]);


	return (
		<div className={classNames('page_flow_pools')}>
			<div className={classNames('flow_top')}>
				<div className={classNames('flow_top_value')}>
					<div className={classNames('flow_top_value_text')}>{t('总锁仓价值')}</div>
					<div className={classNames('flow_top_value_info')}>
						≈ {allLockUpValue}
						<span className={classNames('flow_top_value_unit')}>PLUGCN</span>
						<span className={classNames('flow_top_value_span')}>≈ ${allLockUpDollar}</span>
					</div>
				</div>
				{/* 切换 */}
				<div className={classNames('flow_top_tab')}>
					<ComponentFunctionalButton
						onClick={() => onTabSwitch(0)}
						className={classNames('flow_top_tab_item', tabType === 0 && 'flow_top_tab_select')}>
						{t('全部')}
					</ComponentFunctionalButton>
					<ComponentFunctionalButton
						onClick={() => onTabSwitch(1)}
						className={classNames('flow_top_tab_item', tabType === 1 && 'flow_top_tab_select')}>
						{t('锁仓挖矿')}
					</ComponentFunctionalButton>
					<ComponentFunctionalButton
						onClick={() => onTabSwitch(2)}
						className={classNames('flow_top_tab_item', tabType === 2 && 'flow_top_tab_select')}>
						{t('质押挖矿')}
					</ComponentFunctionalButton>
				</div>
			</div>
			<div className={classNames('flow_content')}>
				{
					itemList.map(item => <FlowItem key={item.id} info={item}></FlowItem>)
				}
			</div>
		</div>
	);
};

export default PageFlowPools;


const FlowItem: FC<{
	info: TypeFlowPoolItem
}> = ({ info }) => {
	const { t } = useTranslation();
	return (
		<div className={classNames('flow_item_box')}>
			<ComponentContentBox
				outerClass={classNames('flow_item_outer')}
				topChildren={
					<div className={classNames('flow_item_top')}>
						<div className={classNames('item_info')}>
							<p className={classNames('item_title')}>{info.name}</p>
							<div className={classNames('item_tags')}>
								<p className={classNames('item_tag', 'item_tag_full')}>{info.profitMul}</p>
								{
									info.type == 'lockup' && <p className={classNames('item_tag', 'item_tag_out')}>{t('锁仓')}</p>
								}
							</div>
						</div>
						<div className={classNames('item_scale')}>
							<p className={classNames('item_scale_value')}>{info.profitScale}</p>
							<p className={classNames('item_scale_tip')}>{t('APY')}</p>
						</div>
					</div>
				}>
				<div className={classNames('item_content_box')}>
					<div className={classNames('item_content_label')}>
						<p className={classNames('item_label_title')}>
							{t(info.type + '_title')}
						</p>
						<div className={classNames('item_label_info')}>
							<p className={classNames('item_label_value')}>{info.did ? info.input : '0.00'}</p>
							<p className={classNames('item_label_util')}>{info.name}</p>
						</div>
					</div>
					{
						info.did && (
							<div className={classNames('item_content_label')}>
								<p className={classNames('item_label_title')}>
									<span>{t('可收取')}</span>
									<ComponentFunctionalButton className={classNames('item_label_title_btn')}>
										{t('收获')}
									</ComponentFunctionalButton>
								</p>
								<div className={classNames('item_label_info')}>
									<p className={classNames('item_label_value')}>{info.did ? info.input : '0.00'}</p>
									<p className={classNames('item_label_util')}>{info.profitSymbol}</p>
								</div>
							</div>
						)
					}
					<p className={classNames('item_label_title', 'item_label_title_item')}>
						<span>{t(info.did ? '挖矿收益(未发放)' : '挖矿奖励')}</span>
						<p className={classNames('item_label_title_value')}>
							{ info.did ? info.allProfitValue : '' } { info.profitSymbol }
						</p>
					</p>
				</div>
				<div className={classNames('item_buttons')}>
					{
						info.did ? (
							info.type === 'lockup' ? (
								<>
									<ComponentFunctionalButton className={classNames('item_button item_button_double item_button_lock')}>
										{t('锁定')}
									</ComponentFunctionalButton>
									<ComponentFunctionalButton className={classNames('item_button item_button_double item_button_unlock')}>
										{t('收获&解锁')}
									</ComponentFunctionalButton>
								</>
							) : (
								<>
									<ComponentFunctionalButton className={classNames('item_button item_button_double item_button_pledge')}>
										{t('质押')}
									</ComponentFunctionalButton>
									<ComponentFunctionalButton className={classNames('item_button item_button_double item_button_withdraw')}>
										{t('收获&解押')}
									</ComponentFunctionalButton>
								</>
							)
						) : (
							<ComponentFunctionalButton className={classNames('item_button item_button_select')}>
								{t('选择')}
							</ComponentFunctionalButton>
						)
					}
				</div>
			</ComponentContentBox>
		</div>
	);
};
