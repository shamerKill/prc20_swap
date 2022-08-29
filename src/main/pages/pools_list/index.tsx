import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FC, useEffect, useState } from 'react';
import { toolNumberStrToFloatForInt, toolNumberToPercentage } from '$tools';
import { dataGetAccountLpList, InSwapPoolInfo } from '$database';
import { ComponentContentBox, ComponentFunctionalButton, ComponentLayoutLoading } from '$components';
import ComLayoutShadowGlass from '$components/layout/shadow-glass';
import { useCustomGetAccountAddress } from '$hooks';

import './index.scss';

const PagePoolsList: FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	// 流动池列表
	const [ poolsList, setPoolsList ] = useState<InSwapPoolInfo[]>([]);
	const [ fetchLoading, setFetchLoading ] = useState<boolean>(false);
	// 账户地址
	const { accountAddress } = useCustomGetAccountAddress();

	// 前往添加流动池
	const goToAddPool = (item?: InSwapPoolInfo) => {
		if (!item) return navigate('./add');
		return navigate(`./add?one=${item.tokenOne.contractAddress}&two=${item.tokenTwo.contractAddress}`);
	}
	// 删除流动池
	const goToDeletePool = (item: InSwapPoolInfo) => {
		return navigate(`./delete?one=${item.tokenOne.contractAddress}&two=${item.tokenTwo.contractAddress}`);
	}

	// 获取数据
	useEffect(() => {
		if (!accountAddress) return;
		setFetchLoading(true);
		dataGetAccountLpList(accountAddress).then(data => {
			if (data.status === 200 && data.data) {
				setPoolsList(data.data);
			}
		}).finally(() => {
			setFetchLoading(false);
		});
	}, [accountAddress]);

	return (
		<ComLayoutShadowGlass glass={accountAddress === undefined} className={classNames('page_pools_list')}>
			{
				<ComponentLayoutLoading showLoading={fetchLoading}></ComponentLayoutLoading>
			}
			<ComponentContentBox
				outerClass={classNames('pools_box_outer')}
				innerClass={classNames('pools_box_inner')}
				topChildren={
					<div className={classNames('pools_head')}>
						<h2 className={classNames('pools_title')}>{t('流动池')}</h2>
						<ComponentFunctionalButton onClick={() => goToAddPool()} className={classNames('pools_add_btn')}>
							<i className={classNames('iconfont', 'icon-chuangjiantianjiapiliangtianjia')}></i>{t('增加流动池')}
						</ComponentFunctionalButton>
					</div>
				}>
				<div
					className={classNames('pools_list_box', (poolsList.length === 0 && (!fetchLoading) && 'pools_list_box_empty'))}
					data-empty={t('未发现流动性仓位')}>
					{
						poolsList.map(item => (
							<div
								className={classNames('pools_item')}
								key={item.id}>
								<div className={classNames('pools_item_top')}>
									<div className={classNames('pools_item_coins')}>
										<div className={classNames('pools_item_logos')}>
											<img className={classNames('pools_item_logo')} src={item.tokenOne.logo} alt={item.tokenOne.symbol} />
											<img className={classNames('pools_item_logo')} src={item.tokenTwo.logo} alt={item.tokenTwo.symbol} />
										</div>
										<p className={classNames('pools_item_symbols')}>
											{item.tokenOne.symbol} / {item.tokenTwo.symbol}
										</p>
									</div>
									<div className={classNames('pools_item_buttons')}>
										<ComponentFunctionalButton className={classNames('pools_item_btn pools_item_add')} onClick={() => goToAddPool(item)}>{t('添加')}</ComponentFunctionalButton>
										<ComponentFunctionalButton className={classNames('pools_item_btn pools_item_remove')} onClick={() => goToDeletePool(item)}>{t('移除')}</ComponentFunctionalButton>
									</div>
								</div>
								<div className={classNames('pools_item_info')}>
									<div className={classNames('pools_item_info_head')}>
										<p className={classNames('pools_item_info_title')}>{item.tokenOne.symbol}</p>
										<p className={classNames('pools_item_info_title')}>{item.tokenTwo.symbol}</p>
										<p className={classNames('pools_item_info_title')}>{t('资金池比例')}</p>
									</div>
									<div className={classNames('pools_item_info_info')}>
										<p className={classNames('pools_item_info_text')}>{toolNumberStrToFloatForInt(item.tokenOne.balance, item.tokenOne.scale)}</p>
										<p className={classNames('pools_item_info_text')}>{toolNumberStrToFloatForInt(item.tokenTwo.balance, item.tokenTwo.scale)}</p>
										<p className={classNames('pools_item_info_text')}>{toolNumberToPercentage(item.poolScale??'0')}</p>
									</div>
								</div>
							</div>
						))
					}
				</div>
			</ComponentContentBox>
		</ComLayoutShadowGlass>
	);
};

export default PagePoolsList;
