import { FC,useEffect,useState } from 'react';
import ComponentBrowserCoinOverview from '../coinOverview';

import ComponentBrowserList from '../list';
import ComponentBrowserTabList from '../tabList';
import { useParams } from 'react-router-dom';
const TokenInfo: FC = () => {
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	useEffect(() => {
		console.log(params.id)
		setCoinPair(params.id)
	}, [params]);
	return (
		<div>
			<ComponentBrowserCoinOverview coinPair={coinPair}></ComponentBrowserCoinOverview>
			<ComponentBrowserList listType={2} coinPair={coinPair}></ComponentBrowserList>
			<ComponentBrowserTabList listType={'all'} token={coinPair}></ComponentBrowserTabList>
		</div>
	);
};

export default TokenInfo;

