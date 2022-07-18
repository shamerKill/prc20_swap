import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import './index.scss';

export const ComponentContentBox: FC<{
	children: ReactNode | ReactNode[],
	topChildren: ReactNode | ReactNode[],
	innerClass?: string;
}> = ({
	children,
	topChildren,
	innerClass,
}) => {
	return (
		<div className={classNames('com-content-box')}>
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
