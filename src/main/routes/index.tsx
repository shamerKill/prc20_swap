import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FC, useContext, useEffect } from 'react';

import { routeTypeStore } from '$database';
import { routesList } from './routes';

import './index.scss';

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
			store.type = 'go';
		}
	}

	const routesListNode = (_list: typeof routesList) => {
		return _list.map((item, index) => {
			return (
				<Route key={item.path + index} {...item}>
					{ item.routes && item.routes.length > 0 && routesListNode(item.routes) }
				</Route>
			);
		});
	};

	return (
		<TransitionGroup component={null}>
			<CSSTransition key={location.key} classNames={store.type === 'go' ? 'route-fade-go' : 'route-fade-back'} timeout={300}>
				<Routes location={location}>
					{
						routesListNode(routesList)
					}
					<Route
						path="*"
						element={<Redirect to="swap/swap" />}
					/>
				</Routes>
			</CSSTransition>
		</TransitionGroup>
	);
};

function Redirect({ to }: { to: string }) {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}