import { FC } from 'react';
import classNames from 'classnames';

import './index.scss';
import { assertSwapStyleImg } from '$services';

export const ComponentSlippage: FC = () => {
	return (
		<div className={classNames('com-slippage-content')}>
			<img className={classNames('com-slippage-img')} src={assertSwapStyleImg.toString()} alt="swap-style" />
		</div>
	);
};
