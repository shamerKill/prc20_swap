import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import './index.scss';

export const ComponentLayoutLoading: FC<{showLoading: boolean, id?: string}> = ({ showLoading, id }) => {
	const [showBox, setShowBox] = useState(false);
	const [removeBox, setRemoveBox] = useState(false);
	const updateDidStatus = useRef(showLoading);
	const updateDidTimer = useRef<number>();
	useEffect(() => {
		setShowBox(showLoading);
		if (showLoading == false) {
			updateDidTimer.current = setTimeout(() => {
				setRemoveBox(true);
			}, 1000) as any;
		} else {
			if (updateDidStatus.current === false) clearTimeout(updateDidTimer.current);
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
