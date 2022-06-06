import classNames from 'classnames';
import { FC, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { ComponentLayoutLoading } from '$components';

import './index.scss';
import { toolFormatPath } from '$tools';

export const ComponentLayoutBase: FC<{
	children?: ReactNode | ReactNode[];
	className?: string;
	loading?: boolean;
}> = ({
	children, className, loading
}) => {
	const location = useLocation();
	// TODO: get router path
	useEffect(() => {
		const routeArr = toolFormatPath(location.pathname);
		console.log(routeArr);
	}, [location]);

	return (
		<div className={classNames('layout-base', className)}>
			{ children }
			{
				loading === true && <ComponentLayoutLoading />
			}
		</div>
	);
};
