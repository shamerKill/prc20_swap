import PageInfo from '$pages/browser';
import PageHome from '$pages/main';
import PagePoolsList from '$pages/pools_list';
import PageSwap from '$pages/swap';
import { useEffect } from 'react';
import { PathRouteProps, useNavigate } from 'react-router-dom';


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
			{
				path: 'browser/:id',
				element: <PageInfo />,
			},
		],
	},
	{
		path: '*',
		element: <Redirect to="swap/swap" />,
	}
];


function Redirect({ to }: { to: string }) {
  let navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
}