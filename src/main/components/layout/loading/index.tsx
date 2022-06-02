import classNames from 'classnames';
import { FC } from 'react';

import './index.scss';

export const ComponentLayoutLoading: FC = () => {
	return (
		<div className={classNames('layout-loading')}>
			<div className="layout-loading-inner"></div>
		</div>
	);
};
