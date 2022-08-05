import { FC,useEffect,useState } from 'react';
// import ComponentBrowserOverview from './overview';
import ComponentBrowserCoinOverview from './coinOverview';

import ComponentBrowserList from './list';
import ComponentBrowserTabList from './tabList';
import { useParams } from 'react-router-dom';
const PageInfo: FC = () => {
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	useEffect(() => {
		setCoinPair(params.id)
	}, [params]);
	return (
		<div>
			<ComponentBrowserCoinOverview coinPair={coinPair}></ComponentBrowserCoinOverview>
			{/* <ComponentBrowserOverview coinPair={coinPair}></ComponentBrowserOverview> */}
			<ComponentBrowserList listType={1}></ComponentBrowserList>
			<ComponentBrowserList listType={2}></ComponentBrowserList>
			<ComponentBrowserTabList listType={2}></ComponentBrowserTabList>
		</div>
	);
};

export default PageInfo;

