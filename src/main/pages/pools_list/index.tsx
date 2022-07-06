import { getDemoData } from '$database';
import { useCustomFetchDataHook } from '$hooks';
import { FC, useEffect } from 'react';

import './index.scss';

const PagePoolsList: FC = () => {
	const {data, fetched} = useCustomFetchDataHook(getDemoData);

	useEffect(() => {
		if (fetched) console.log(data);
	}, [data, fetched]);

	return (
		<div>PoolsList</div>
	);
};

export default PagePoolsList;
