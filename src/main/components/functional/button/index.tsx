import { FC, ReactNode } from 'react';
import classNames from 'classnames';

import './index.scss';

export const ComponentFunctionalButton: FC<{
	children?: ReactNode | ReactNode[];
	className?: string;
	loading?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({
	children, className, loading, onClick
}) => {
	return (
		<button disabled={loading} onClick={onClick} className={classNames(className, 'component-functional-button')}>
			{children}
		</button>
	);
};
