import { FC,useEffect,useState,useRef } from 'react';
import ComponentBrowserLpOverview from '../lpOverview';

import ComponentBrowserTabList from '../tabList';
import { useParams,useNavigate } from 'react-router-dom';
import { useCustomGetAppVersion } from '$hooks';
import { TypeAppVersion } from '$types';
const DetailInfo: FC = () => {
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	const [ appVersion ] = useCustomGetAppVersion();
	const navigate = useNavigate();
	let versoins = useRef<TypeAppVersion>();
	useEffect(() => {
		if (appVersion && versoins.current && appVersion !== versoins.current) {
			navigate('/swap/browser/pc');
		} else {
			versoins.current = appVersion;
		}
	}, [appVersion]);
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

