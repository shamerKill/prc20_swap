import { FC, ReactNode } from 'react';
import classNames from 'classnames';

const ComponentSwapInputBox: FC<{
	children?: ReactNode | ReactNode[];
}> = () => {
	return (
		<div className={classNames('com-swap-input')}>
			swap-input
		</div>
	);
};

export default ComponentSwapInputBox;
