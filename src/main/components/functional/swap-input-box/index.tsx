import { ChangeEventHandler, FC, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';
import { InEvmBalanceToken } from '$database';
import { ComponentFunctionalButton } from '../button';

import './index.scss';
import { ComponentLayoutLoading } from '$components/layout/loading';
import { useTranslation } from 'react-i18next';

const ComponentSwapInputBox: FC<{
	children?: ReactNode | ReactNode[];
	inputs?: {
		labelText?: string;
		labelToken?: InEvmBalanceToken | null;
		inputText?: string;
		inputChange?: ChangeEventHandler<HTMLInputElement>;
		placeholder?: string;
		selectToken?: () => void;
		key: string;
	}[];
	hintText?: string;
	buttonText?: string;
	buttonOnClick?:  MouseEventHandler<HTMLButtonElement>;
	loading?: boolean;
}> = ({
	children, inputs, hintText, buttonOnClick, buttonText, loading
}) => {
	const {t} = useTranslation();
	console.log(inputs);
	return (
		<div className={classNames('com-swap-input-box')}>
			<div className={classNames('com-swap-input-list')}>
				{
					inputs?.map((item) => (
						<div key={item.key} className={classNames('com-swap-input-inner')}>
							<p className={classNames('com-swap-label')}>
								<span>{item.labelText}</span>
								{
									item.labelToken && <span>{t('余额')}: {item.labelToken?.balance}</span>
								}
							</p>
							<div className={classNames('com-swap-content')}>
								<input
									className={classNames('com-swap-input')}
									type="number"
									value={item.inputText}
									onChange={item.inputChange}  />
								<ComponentFunctionalButton
									className={classNames('com-swap-button', item.labelToken && 'com-swap-button-selected')}
									onClick={item.selectToken}>
									{
										item.labelToken ? (
											<>
												<img className={classNames('com-swap-button-logo')} src={item.labelToken.logo} alt={item.labelToken.symbol} />
												<span className={classNames('com-swap-button-span')}>{item.labelToken.symbol}</span>
											</>
										) : (
											<span className={classNames('com-swap-button-span')}>{t('选择代币')}</span>
										)
									}
									<i className={classNames('com-swap-icon', 'iconfont', 'icon-xiajiantou')}></i>
								</ComponentFunctionalButton>
							</div>
							{/* 下一步 */}
							<span className={classNames('com-swap-input-step', 'iconfont', 'icon-angle-double-down')}></span>
						</div>
					))
				}
			</div>
			<p className={classNames('com-swap-hint')}>{ hintText }</p>
			<ComponentFunctionalButton
				className={classNames('com-swap-btn')}
				onClick={buttonOnClick}>
				{ buttonText }
			</ComponentFunctionalButton>
			<ComponentLayoutLoading showLoading={loading??false} />
		</div>
	);
};

export default ComponentSwapInputBox;
