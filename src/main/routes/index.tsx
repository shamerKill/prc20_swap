import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { routesList } from './routes';
import { FC, useContext } from 'react';

import { routeTypeStore } from '$database';

import './index.scss';

export { enumRoutes } from './routes'

export const RouterApp = () => {
	return (
		<BrowserRouter>
			<RouteList />
		</BrowserRouter>
	);
};

const RouteList: FC = () => {
  const location = useLocation();
	const store = useContext(routeTypeStore);

	if (store.list.length === 0) {
		store.list.push(location.pathname);
	} else {
		const backPath = store.list[store.list.length - 2];
		const lastPath = store.list[store.list.length - 1];
		if (backPath === location.pathname) {
			store.list.pop();
			store.type = 'back';
		} else if (lastPath !== location.pathname) {
			store.list.push(location.pathname);
		}
	}

	return (
		<TransitionGroup component={null}>
			<CSSTransition key={location.key} classNames={store.type === 'go' ? 'route-fade-go' : 'route-fade-back'} timeout={300}>
				<Routes location={location}>
					{
						routesList.map((item, index) => {
							return (
								<Route key={item.path + index} {...item}></Route>
							);
						})
					}
				</Routes>
			</CSSTransition>
		</TransitionGroup>
	);
};