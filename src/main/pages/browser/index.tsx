import { FC,useEffect,useState } from 'react';
import ComponentBrowserOverview from './overview';

import ComponentBrowserList from './list';
import ComponentBrowserTabList from './tabList';
import { useParams } from 'react-router-dom';
const PageInfo: FC = () => {
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	useEffect(() => {
		console.log(params.id)
		setCoinPair(params.id)
	}, [params]);
	return (
		<div>
			<ComponentBrowserOverview coinPair={coinPair}></ComponentBrowserOverview>
			<ComponentBrowserList listType={1} coinPair={coinPair}></ComponentBrowserList>
			<ComponentBrowserList listType={2} coinPair={coinPair}></ComponentBrowserList>
		</div>
	);
};

export default PageInfo;

