import { FC, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { map } from 'rxjs';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { ComponentLayoutBase, ComponentFunctionalButton } from '$components';
import { assertLogoImg } from '$services';
import { accountStore } from '$database';
import { useCustomGetAccountAddress, useCustomGetAppVersion, useCustomRouteFormatPath } from '$hooks';
import { LANGUAGE_EN, LANGUAGE_ZH, toolHideAddressCenter, toolFormatPath, toolLinkWallet, toolTimeSleep, setDefaultLanguage } from '$tools';

import './index.scss';
import { TypeAppVersion } from '$types';

const PageHome: FC = () => {
	const { i18n, t } = useTranslation();
	// 版本号
	const [ appVersion, setAppVersion ] = useCustomGetAppVersion();
	const [walletLinking, setWalletLinking] = useState(false);
	// 账户地址
	const { accountAddress, setAccountAddress } = useCustomGetAccountAddress();
	const [showLoading, setShowLoading] = useState(false);
	const navigate = useNavigate();
	const [, routeGroup ] = useCustomRouteFormatPath();
	const [routeLoading, setRouteLoading] = useState(false);
	// 是否显示版本切换
	const [ showVersionBtn, setShowVersionBtn ] = useState(true);

	// 连接钱包
	const linkWallet = async (init: boolean = false) => {
		setShowLoading(true);
		const result = await toolLinkWallet(init);
		setShowLoading(false);
		if (result === null) return;
		if (result.accountType === 'PRC10') {
			changeVersion('v1');
			setShowVersionBtn(false);
		} else {
			setShowVersionBtn(true);
		}
		accountStore.next(result);
	};

	// 切换语言
	const changeLanguage = async () => {
		if (i18n.language == LANGUAGE_EN) {
			setDefaultLanguage(LANGUAGE_ZH);
		} else if (i18n.language == LANGUAGE_ZH) {
			setDefaultLanguage(LANGUAGE_EN);
		}
	};

	// 切换版本
	const changeVersion = async (type?: TypeAppVersion) => {
		setShowLoading(true);
		await toolTimeSleep(100);
		navigate(window.location.pathname, { replace: true });
		await toolTimeSleep(1000);
		if (type) {
			setAppVersion(type);
		} else {
			if (appVersion === 'v2') {
				setAppVersion('v1');
			} else {
				setAppVersion('v2');
			}
		}
		await toolTimeSleep(1000);
		if (/flowPools/.test(routeGroup)) {
			navigate('/swap/swap');
		}
		setShowLoading(false);
	};

	const onRouteTab = async (link: string) => {
		if (routeLoading) return;
		if (toolFormatPath(link)[1] == routeGroup&&link!='/swap/browser/uplugcn') return;
		setRouteLoading(true);
		await new Promise(resolve => setTimeout(resolve, 50));
		navigate(link);
		await new Promise(resolve => setTimeout(resolve, 300));
		setRouteLoading(false);
	}

	useEffect(() => {
		linkWallet(true);
		const sub = accountStore.pipe(map(item => item.accountAddress)).subscribe((accountAddress) => {
			if (accountAddress && accountAddress != '') {
				setWalletLinking(true);
				setAccountAddress(accountAddress);
			} else {
				setWalletLinking(false);
				setAccountAddress('');
			}
		});
		return () => sub.unsubscribe();
	}, []);

	return (
		<ComponentLayoutBase loading={showLoading} className={classNames('main_base')}>
			<div className={classNames('main_base_nav')}>
				<Link className={classNames('main_base_logo_box')} to="/">
					<img className={classNames('main_base_logo')} src={assertLogoImg.toString()} alt="logo" />
				</Link>
				<div className={classNames('main_base_center')}>
					{
						walletLinking ?
						(
							<div className={classNames('main_base_connect', walletLinking && 'main_base_connected')}>
								<p className={classNames('main_base_connect_account')}>{toolHideAddressCenter(accountAddress??'')}</p>
							</div>
						) : (
							<ComponentFunctionalButton loading={showLoading} className={classNames('main_base_connect', walletLinking && 'main_base_connected')} onClick={() => linkWallet()}>
								<span className={classNames('main_base_connect_text')}>{t('connect wallet')}</span>
								<span className={classNames('main_base_connect_icon')}>
									<i className={classNames('iconfont', 'icon-jiantou_xiangzuo')}></i>
								</span>
							</ComponentFunctionalButton>
						)
					}
				</div>
				<hr className={classNames('main_base_line')} />
				<div className={classNames('main_base_nav_group')}>
					<div className={classNames('main_base_nav_link', routeGroup == 'swap' && 'main_base_nav_active')} onClick={() => onRouteTab('/swap/swap')}>
						<span className={classNames('main_base_nav_link_icon')}>
							<i className={classNames('iconfont', 'icon-duihuan')}></i>
						</span>
						<span className={classNames('main_base_nav_link_text')}>
							{t('swap')}
						</span>
						<i className={classNames('iconfont', 'icon_version', appVersion === 'v1' ? 'icon-v1' : 'icon-v2')}></i>
					</div>
					<div className={classNames('main_base_nav_link', routeGroup == 'poolsList' && 'main_base_nav_active')} onClick={() => onRouteTab('/swap/poolsList')}>
						<span className={classNames('main_base_nav_link_icon')}>
							<i className={classNames('iconfont', 'icon-liudongchi')}></i>
						</span>
						<span className={classNames('main_base_nav_link_text')}>
							{t('pool')}
						</span>
						<i className={classNames('iconfont', 'icon_version', appVersion === 'v1' ? 'icon-v1' : 'icon-v2')}></i>
					</div>
					<div className={classNames('main_base_nav_link', routeGroup == 'browser' && 'main_base_nav_active')} onClick={() => onRouteTab('/swap/browser/pc')}>
						<span className={classNames('main_base_nav_link_icon')}>
							<i className={classNames('iconfont', 'icon-liulanqi')}></i>
						</span>
						<span className={classNames('main_base_nav_link_text')}>
							{t('browser')}
						</span>
						<i className={classNames('iconfont', 'icon_version', appVersion === 'v1' ? 'icon-v1' : 'icon-v2')}></i>
					</div>
					{/* {
						appVersion === 'v2' && (
							<div className={classNames('main_base_nav_link', routeGroup == 'flowPools' && 'main_base_nav_active')} onClick={() => onRouteTab('/swap/flowPools')}>
								<span className={classNames('main_base_nav_link_icon')}>
									<i className={classNames('iconfont', 'icon-liudongchi')}></i>
								</span>
								<span className={classNames('main_base_nav_link_text')}>
									{t('流动性矿池')}
								</span>
							</div>
						)
					} */}
					{
						showVersionBtn && (
							<ComponentFunctionalButton className={classNames('main_base_nav_btn')} onClick={() => changeVersion()}>
								<span className={classNames('main_base_nav_link_icon')}>
									<i className={classNames('iconfont', appVersion === 'v1' ? 'icon-canpinhuihuiyuanv1' : 'icon-canpinhuihuiyuanv2')}></i>
								</span>
								<span className={classNames('main_base_nav_link_text')}>
									{t('版本切换')}
								</span>
							</ComponentFunctionalButton>
						)
					}
				</div>
				<hr className={classNames('main_base_line')} />
					<ComponentFunctionalButton loading={showLoading} className={classNames('main_base_language', walletLinking && 'main_base_language_linked')} onClick={changeLanguage}>
						<span className={classNames('main_base_language_text')}>{t('language ' + i18n.language)}</span>
						<span className={classNames('main_base_language_icon')}>
							<i className={classNames('iconfont', 'icon-yuyan')}></i>
						</span>
					</ComponentFunctionalButton>
			</div>

			<div className={classNames('main_base_content', walletLinking && 'main_base_content_linked')}>
				{
					showVersionBtn && (
						<ComponentFunctionalButton className={classNames('main_base_version_btn')} onClick={() => changeVersion()}>
							<span className={classNames('main_base_nav_link_icon')}>
								<i className={classNames('iconfont', 'icon-duihuan')}></i>
							</span>
							<span className={classNames('main_base_nav_link_text')}>
								{t('版本切换')}
							</span>
						</ComponentFunctionalButton>
					)
				}
				<div className={classNames('main_base_route')}>
					<Outlet />
					{
						routeLoading && <div className={classNames('main_base_content_shadow')}></div>
					}
				</div>
			</div>
		</ComponentLayoutBase>
	);
};

export default PageHome;
