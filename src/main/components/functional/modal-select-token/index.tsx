import ComponentLayoutRefresh from "$components/layout/refresh";
import { InEvmBalanceToken } from "$database";
import { layoutModalHide } from "$database/layout-data";
import classNames from "classnames";
import { FC, MouseEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ComponentFunctionalButton } from "../button";

import './index.scss';

// 选择代币
export const ComModalSelectToken: FC<{
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
				symbol: 'plug ' + Math.random().toFixed(5),
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
		<div className={classNames('com-swap-token-select')}>
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