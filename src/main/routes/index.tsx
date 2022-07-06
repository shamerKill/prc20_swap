import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { FC, useEffect } from 'react';

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
		<Routes location={location}>
			{
				routesListNode(routesList)
			}
			<Route
				path="*"
				element={<Redirect to="swap/swap" />}
			/>
		</Routes>
	);
};

function Redirect({ to }: { to: string }) {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}