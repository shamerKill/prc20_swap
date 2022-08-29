import ComponentLayoutRefresh from "$components/layout/refresh";
import { dataGetAccountTokenBalance, dataGetTokenCoreList, dataGetTokenLocalList, dataSearchToken, dataSetTokenLocalList, InEvmBalanceToken } from "$database";
import { layoutModalHide } from "$database/layout-data";
import { useCustomFetchDataHook, useCustomGetAccountAddress, useCustomGetAppVersion } from "$hooks";
import { toolHideAddressCenter, toolNumberStrToFloatForInt } from "$tools";
import classNames from "classnames";
import { FC, MouseEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ComponentFunctionalButton } from "../button";

import './index.scss';

// 选择代币
export const ComModalSelectToken: FC<{
	onSelect: (data: InEvmBalanceToken) => void;
	filterContractArr: string[];
}> = ({ onSelect, filterContractArr }) => {
	const {t} = useTranslation();
	const accountAddressRef = useRef<string>();
	const [ appVersion ] = useCustomGetAppVersion();
	const { accountAddress } = useCustomGetAccountAddress();
	const [ searchText, setSearchText ] = useState<string>('');
	const [ localTokenList, setLocalTokenList ] = useState<InEvmBalanceToken[]>([]);
	const [ remoteTokenList, setRemoteTokenList ] = useState<InEvmBalanceToken[]>([]);
	const [ searchTokenList, setSearchTokenList ] = useState<InEvmBalanceToken[]>();
	const [ loading, setLoading ] = useState<boolean>(false);
	// 是不是管理列表
	const [ adminPage, setAdminPage ] = useState<boolean>(false);
	// 删除提示显示
	const [ deleteTipShow, setDeleteTipShow ] = useState<boolean>(false);
	// 删除代币暂存
	const [ willDeleteToken, setWillDeleteToken ] = useState<InEvmBalanceToken>();
	// 是否获取过余额
	const [ hadBalance, setHadBalance ] = useState(false);
	// 防抖
	const doubleTimer = useRef<number>();

	// 获取远程数据
	const { fetched, data: fetchedData, fetchData: getRemoteList } = useCustomFetchDataHook(dataGetTokenCoreList, false);

	// 选择方法
	const onItemClick = (data: InEvmBalanceToken) => {
		onSelect(data);
		layoutModalHide();
	};
	// 添加本地
	const onItemAdd = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, token: InEvmBalanceToken) => {
		event.preventDefault();
		event.stopPropagation();
		const saveList = localTokenList.filter(item => token.contractAddress !== item.contractAddress);
		saveList.unshift(token);
		setRemoteTokenList(state => state.filter(item => item.contractAddress !== token.contractAddress));
		setLocalTokenList(saveList);
	}

	// 切换管理列表
	const onSwitchAdmin = () => setAdminPage(state => {
		if (!state === false && appVersion) getRemoteList(appVersion);
		return !state;
	});

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

	// 远程数据赋值
	useEffect(() => {
		if (appVersion) getRemoteList(appVersion);
	}, [appVersion]);
	useEffect(() => {
		if (fetched && fetchedData?.data !== undefined && accountAddressRef.current && appVersion) {
			// 获取账户余额
			(async () => {
				setHadBalance(false);
				const localData = await dataGetTokenLocalList(accountAddressRef.current??'', appVersion);
				const localContract = localData.map(item => item.contractAddress);
				const remoteList = fetchedData.data?.filter(item => !localContract.includes(item.contractAddress)) ?? [];
				const balances = (await dataGetAccountTokenBalance(
					accountAddressRef.current!,
					remoteList.map(item => item.contractAddress)||[]
				)).data!;
				setRemoteTokenList(
					remoteList.map((item, index) => ({...item, balance: toolNumberStrToFloatForInt(balances[index], item.scale)}))||[]
				);
				setHadBalance(true);
			})();
		}
	}, [fetchedData, fetched, appVersion]);
	// 设置本地数据
	useEffect(() => {
		if (!accountAddressRef.current || !appVersion) return;
		dataSetTokenLocalList(localTokenList, accountAddressRef.current!, appVersion);
	}, [localTokenList, appVersion]);
	// 本地数据
	useEffect(() => {
		if (!accountAddress || !appVersion) return;
		(async () => {
			const localData = await dataGetTokenLocalList(accountAddress, appVersion);
			if (localData.length === 0) return setLocalTokenList([]);
			const balances = (await dataGetAccountTokenBalance(
				accountAddressRef.current!,
				localData.map(item => item.contractAddress)||[]
			)).data!;
			setLocalTokenList(localData.map((item, index) => ({...item, balance: toolNumberStrToFloatForInt(balances[index], item.scale)})));
		})();
	}, [accountAddress, appVersion]);
	// loading
	useEffect(() => {
		if (fetched === true && hadBalance === true) setLoading(false);
		else setLoading(true);
	}, [fetched, hadBalance]);
	// 删除
	useEffect(() => {
		if (deleteTipShow === false) setWillDeleteToken(undefined);
	}, [deleteTipShow]);
	useEffect(() => {
		accountAddressRef.current = accountAddress;
	}, [accountAddress]);
	useEffect(() => {
		setSearchText('');
	}, [adminPage]);

	// 监听搜索
	useEffect(() => {
		if (searchText === '') {
			setSearchTokenList(undefined);
			return;
		}
		if (doubleTimer.current !== undefined) clearTimeout(doubleTimer.current);
		doubleTimer.current = setTimeout(async () => {
			// 判断是否在本地列表中
			const localList = localTokenList.filter(item => (
				item.contractAddress === searchText || item.symbol === searchText
			));
			if (localList.length !== 0) return setSearchTokenList(localList);
			// 判断是否在远程列表中
			const remoteList = remoteTokenList.filter(item => (
				item.contractAddress === searchText || item.symbol === searchText
			));
			if (remoteList.length !== 0) return setSearchTokenList(remoteList);
			setLoading(true);
			const result = await dataSearchToken(searchText);
			setLoading(false);
			if (result.status === 200 && result.data) {
				if (result.data?.length === 0) {
					setSearchTokenList([]);
				} else {
					setLoading(true);
					const balances = (await dataGetAccountTokenBalance(
						accountAddressRef.current!,
						result.data.map(item => item.contractAddress)||[]
					)).data!;
					setLoading(false);
					setSearchTokenList(result.data.map((item, index) => ({...item, balance: toolNumberStrToFloatForInt(balances[index], item.scale)})));
				}
			}
		}, 1 * 1000) as unknown as number;
	}, [searchText]);

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
							loading={loading}>
							{
								!searchTokenList && localTokenList.map(item => (
									<div
										onClick={() => onItemClick(item)}
										className={classNames('token_select_item', filterContractArr.includes(item.contractAddress)&&'token_select_item_bg')}
										key={item.symbol + item.minUnit + item.contractAddress}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<div className={classNames('token_select_info')}>
											<p className={classNames('token_select_symbol')}>{item.symbol}</p>
											<p className={classNames('token_select_address')}>{toolHideAddressCenter(item.contractAddress)}</p>
										</div>
										<p className={classNames('token_select_balance')}>{item.balance}</p>
									</div>
								))
							}
							{
								!searchTokenList && remoteTokenList.map(item => (
									<div
										onClick={() => onItemClick(item)}
										className={classNames('token_select_item', filterContractArr.includes(item.contractAddress)&&'token_select_item_bg')}
										key={item.symbol + item.minUnit + item.contractAddress}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<div className={classNames('token_select_info')}>
											<p className={classNames('token_select_symbol')}>{item.symbol}</p>
											<p className={classNames('token_select_address')}>{toolHideAddressCenter(item.contractAddress)}</p>
										</div>
										<p className={classNames('token_select_balance')}>{item.balance}</p>
										<ComponentFunctionalButton
											onClick={e => onItemAdd(e, item)}
											className={classNames('token_select_add')}>
											{t('添加')}
										</ComponentFunctionalButton>
									</div>
								))
							}
							{
								searchTokenList && searchTokenList.map(item => (
									<div
										onClick={() => onItemClick(item)}
										className={classNames('token_select_item', filterContractArr.includes(item.contractAddress)&&'token_select_item_bg')}
										key={item.symbol + item.minUnit + item.contractAddress}>
										<img className={classNames('token_select_logo')}
											src={item.logo}
											alt={item.symbol} />
										<div className={classNames('token_select_info')}>
											<p className={classNames('token_select_symbol')}>{item.symbol}</p>
											<p className={classNames('token_select_address')}>{toolHideAddressCenter(item.contractAddress)}</p>
										</div>
										<p className={classNames('token_select_balance')}>{item.balance}</p>
										{
											(localTokenList.filter(local => local.contractAddress === item.contractAddress).length === 0) && (
												<ComponentFunctionalButton
													onClick={e => onItemAdd(e, item)}
													className={classNames('token_select_add')}>
													{t('添加')}
												</ComponentFunctionalButton>
											)
										}
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
										<div className={classNames('token_select_info')}>
											<p className={classNames('token_select_symbol')}>{item.symbol}</p>
											<p className={classNames('token_select_address')}>{toolHideAddressCenter(item.contractAddress)}</p>
										</div>
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