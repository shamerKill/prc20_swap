import PageHome from '$pages/home';
import { PathRouteProps } from 'react-router-dom';

export const enumRoutes: {
	readonly [key: string]: {
		readonly path: string;
		readonly element: React.ReactNode;
	}
} = {
	home: {
		path: '/',
		element: <PageHome />,
	},
};


export const routesList: PathRouteProps[] = [
	{...enumRoutes.home, caseSensitive: true},
];