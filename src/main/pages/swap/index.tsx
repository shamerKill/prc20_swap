import { FC, useState } from 'react';
import classNames from 'classnames';
import { ComponentContentBox, ComponentFunctionalButton } from '$components';

import './index.scss';
import { useTranslation } from 'react-i18next';
import { ComponentSlippage } from '$components/functional/slippage';
import { InEvmToken } from '$database';
import { toolNumberDiv } from '$tools';
import ComponentSwapInputBox from '$components/functional/swap-input-box';

const PageSwap: FC = () => {
	const {t} = useTranslation();
	// 支付数量
	const [fromVolume, setFromVolume] = useState('');
	// 兑换出来的数量
	const [toVolume, setToVolume] = useState('');
	// 兑换率影响
	const [swapRateParameter, setSwapRateParameter] = useState('0.0');
	// 最小接受额
	const [minReceive, setMinReceive] = useState('0.0');
	// 网络费用
	const [netWorkFee, setNetWorkFee] = useState('0.0');
	// from币信息
	const [fromTokenInfo, setFromTokenInfo] = useState<InEvmToken|null>(null);
	// to币信息
	const [toTokenInfo, setToTokenInfo] = useState<InEvmToken|null>(null);
	// 交易池内from币数量
	const [fromTokenVolume, setFromTokenVolume] = useState<String|null>(null);
	// 交易池内to币数量
	const [toTokenVolume, setToTokenVolume] = useState<String|null>(null);
	// 用户from币余额
	const [fromTokenBalance, setFromTokenBalance] = useState<String|null>(null);
	// 用户to币余额
	const [toTokenBalance, setToTokenBalance] = useState<String|null>(null);

	return (
		<div className={classNames('page_swap')}>
			<ComponentContentBox
				topChildren={<h2 className={classNames('swap_title')}>{t('swap')}</h2>}
				innerClass={classNames('swap_inner')}>
				{/* 兑换操作 */}
				<div className={classNames('inner_functional')}>
					<ComponentSwapInputBox />
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
