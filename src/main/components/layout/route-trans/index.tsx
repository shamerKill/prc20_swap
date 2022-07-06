import { FC, ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const ComponentLayoutRouteTrans: FC<{
	children?: ReactNode | ReactNode[];
	transKey: any;
}> = ({
	children, transKey
}) => {
	const location = useLocation();
	// 判断路由前进还是后退
	const [routeType] = useState<{
		type: 'back' | 'go',
		list: string[],
	}>({type: 'go', list: []});

	if (routeType.list.length === 0) {
		routeType.list.push(location.pathname);
	} else {
		const backPath = routeType.list[routeType.list.length - 2];
		const lastPath = routeType.list[routeType.list.length - 1];
		if (backPath === location.pathname) {
			routeType.list.pop();
			routeType.type = 'back';
		} else if (lastPath !== location.pathname) {
			routeType.list.push(location.pathname);
			routeType.type = 'go';
		}
	}

	return (
		<TransitionGroup component={null}>
			<CSSTransition key={transKey} classNames={routeType.type === 'go' ? 'route-fade-go' : 'route-fade-back'} timeout={3000}>
				{ children }
			</CSSTransition>
		</TransitionGroup>
	);
};

export default ComponentLayoutRouteTrans;
