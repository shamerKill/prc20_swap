import { FC,useEffect,useState } from 'react';
import ComponentBrowserLpOverview from '../lpOverview';

import ComponentBrowserList from '../list';
import ComponentBrowserTabList from '../tabList';
import { useParams } from 'react-router-dom';
const DetailInfo: FC = () => {
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	useEffect(() => {
		setCoinPair(params.id)
	}, [params]);
	return (
		<div>
			<ComponentBrowserLpOverview coinPair={coinPair}></ComponentBrowserLpOverview>
			<ComponentBrowserTabList listType={'all'} token={coinPair}></ComponentBrowserTabList>
		</div>
	);
};

export default DetailInfo;

