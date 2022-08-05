import { ComponentLayoutLoading } from '$components/layout/loading';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import './index.scss';

export const ComponentContentBox: FC<{
	children: ReactNode | ReactNode[],
	topChildren: ReactNode | ReactNode[],
	outerClass?: string;
	innerClass?: string;
}> = ({
	children,
	topChildren,
	outerClass,
	innerClass,
}) => {
	return (
		<div className={classNames('com-content-box', outerClass)}>
			{
				topChildren
			}
			<div className={classNames('com-content-inner', innerClass)}>
				{
					children
				}
			</div>
		</div>
	);
};
