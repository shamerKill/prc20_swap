import PageHome from '$pages/main';
import PagePoolsList from '$pages/pools_list';
import PageSwap from '$pages/swap';
import { PathRouteProps } from 'react-router-dom';


export const routesList: (PathRouteProps & {
	routes?: PathRouteProps[];
})[] = [
	{
		path: 'swap',
		element:	<PageHome />,
		routes: [
			{
				path: 'swap',
				element: <PageSwap />,
			},
			{
				path: 'poolsList',
				element: <PagePoolsList />,
			},
		],
	},
];
