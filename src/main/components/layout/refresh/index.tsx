import classNames from 'classnames';
import { FC, ReactNode, useRef } from 'react';
import { ComponentLayoutLoading } from '../loading';

import './index.scss';

const ComponentLayoutRefresh: FC<{
	loadingHandler?: () => void;
	loading?: boolean;
	children?: ReactNode|ReactNode[];
	className?: string;
}> = ({
	loadingHandler, loading = false, children, className
}) => {
	const scrollBox = useRef<HTMLDivElement>();
	const scrollInner = useRef<HTMLDivElement>();

	const onScroll = () => {
		const boxHeight = scrollBox.current?.clientHeight??0;
		const scrollHeight = scrollBox.current?.scrollTop??0;
		const innerHeight = scrollInner.current?.clientHeight??0;
		if (innerHeight + 5 <= boxHeight + scrollHeight && loading === false) {
			loadingHandler?.();
		}
	}

	return (
		<div
			className={classNames('com-refresh-box', className)}
			ref={scrollBox as React.RefObject<HTMLDivElement>}
			onScroll={onScroll}>
			<div className={classNames('com-refresh-scroll')} ref={scrollInner as React.RefObject<HTMLDivElement>}>
				{ children }
			</div>
			<ComponentLayoutLoading showLoading={loading}></ComponentLayoutLoading>
		</div>
	);
};

export default ComponentLayoutRefresh;
