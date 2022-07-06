import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import './index.scss';

export const ComponentLayoutLoading: FC<{showLoading: boolean}> = ({ showLoading }) => {
	const [showBox, setShowBox] = useState(false);
	const [removeBox, setRemoveBox] = useState(false);
	useEffect(() => {
		setShowBox(showLoading);
		if (showLoading == false) {
			setTimeout(() => {
				setRemoveBox(true);
			}, 1000);
		} else {
			setRemoveBox(false);
		}
	}, [showLoading]);
	if (removeBox) {
		return <></>
	}
	return (
		<div className={classNames('layout-loading', showBox ? 'layout-loading-show' : 'layout-loading-hide')}>
			<div className="layout-loading-inner"></div>
		</div>
	);
};
