import { FC, ReactNode } from 'react';
import classNames from 'classnames';

import './index.scss';

const ComLayoutShadowGlass: FC<{
	glass: boolean,
	className?: string;
	children?: ReactNode|ReactNode[];
}> = ({ glass, className, children }) => {
	return (
		<div className={classNames(className, 'com-shadow-glass-default', glass&&'com-shadow-glass')}>
			{children}
		</div>
	);
};

export default ComLayoutShadowGlass;
