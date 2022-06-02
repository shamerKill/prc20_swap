import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { ComponentLayoutLoading } from '$components';

import './index.scss';

export const ComponentLayoutBase: FC<{
	children?: ReactNode | ReactNode[];
	className?: string;
	loading?: boolean;
}> = ({
	children, className, loading
}) => {
	return (
		<div className={classNames('layout-base', className)}>
			{ children }
			{
				loading === true && <ComponentLayoutLoading />
			}
		</div>
	);
};
