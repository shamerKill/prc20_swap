import React, { FC, MouseEventHandler, MutableRefObject, ReactNode } from 'react';
import classNames from 'classnames';
import { InEvmBalanceToken } from '$database';
import { ComponentFunctionalButton } from '../button';

import './index.scss';
import { ComponentLayoutLoading } from '$components/layout/loading';
import { useTranslation } from 'react-i18next';
import { toolNumberGetDecimalLength } from '$tools';

const ComponentSwapInputBox: FC<{
	children?: ReactNode | ReactNode[];
	inputs?: {
		labelText?: string;
		labelToken?: InEvmBalanceToken | null;
		inputText?: string;
		inputChange?: (value: string) => void;
		placeholder?: string;
		selectToken?: () => void;
		key: string;
		disabled?: boolean;
		checkMax?: boolean;
	}[];
	hintText?: string;
	buttonText?: string;
	buttonOnClick?:  MouseEventHandler<HTMLButtonElement>;
	tokenTransfer?: () => void;
	loading?: boolean;
	focusIndex?: MutableRefObject<number | undefined>;
}> = ({
	inputs, hintText, buttonOnClick, buttonText, loading, focusIndex, tokenTransfer,
}) => {
	const {t} = useTranslation();
	return (
		<div className={classNames('com-swap-input-box')}>
			<div className={classNames('com-swap-input-list')}>
				{
					inputs?.map((item, index) => (
						<React.Fragment key={item.key}>
							<div className={classNames('com-swap-input-inner')}>
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
										disabled={item.disabled??false}
										onBlur={e => {
											if (Number.isNaN(parseFloat(e.target.value))) {
												item.inputChange?.('0');
											}
											if (focusIndex) focusIndex.current = undefined;
										}}
										onFocus={e => {
											const value = parseFloat(e.target.value);
											if (value === 0) item.inputChange?.('');
											if (focusIndex) focusIndex.current = index;
										}}
										onChange={e => {
											let value: string = e.target.value;
											if (!item.labelToken) return;
											if (/-/.test(value)) return;
											if (item.checkMax === true) {
												if (parseFloat(value??'0') > parseFloat(item.labelToken?.balance??'0')) {
													value = item.labelToken?.balance || '0';
												}
											}
											if (toolNumberGetDecimalLength(value) > (item.labelToken?.scale??0)) return;
											item.inputChange?.(value);
										}}  />
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
							</div>
							{/* 下一步 */}
							{
								index !== inputs.length - 1 && (
									<div className={classNames('com-swap-input-step-box')}>
										<ComponentFunctionalButton onClick={tokenTransfer} className={classNames('com-swap-input-step', 'iconfont', 'icon-angle-double-down')}></ComponentFunctionalButton>
									</div>
								)
							}
						</React.Fragment>
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
