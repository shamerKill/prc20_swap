import { FC } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { ComponentLayoutBase } from '$components';

import './index.scss';

const PageHome: FC = () => {

	return (
		<ComponentLayoutBase>
			a simple react project
			<br />
			<Link to="/swap/swap">
				swap
			</Link>
			<br />
			<Link to="/swap/poolsList">
				poolsList
			</Link>
			<Outlet />
		</ComponentLayoutBase>
	);
};

export default PageHome;
