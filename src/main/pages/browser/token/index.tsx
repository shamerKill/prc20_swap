import { FC,useEffect,useState,useRef } from 'react';
import classNames from 'classnames';
import './index.scss';
import ComponentBrowserCoinOverview from '../coinOverview';

import ComponentBrowserList from '../list';
import ComponentBrowserTabList from '../tabList';
import { useParams,useNavigate } from 'react-router-dom';
import { useCustomGetAppVersion } from '$hooks';
import { TypeAppVersion } from '$types';
import { useTranslation } from 'react-i18next';
type dataType = {
	name: string,
	type: string
}
const TokenInfo: FC = () => {
	const { t } = useTranslation();
	const [coinPair,setCoinPair] = useState('')
	const params:any = useParams();
	const [ appVersion ] = useCustomGetAppVersion();
	const navigate = useNavigate();
  const lineList:Array<dataType> = [
		{
			name: t('全部'),
			type: 'all',
		},{
			name: t('兑换'),
			type: 'swap',
		},{
			name: t('增加'),
			type: 'add',
		},{
			name: t('移除'),
			type: 'sub',
		}
	]
	const [lineIndex,setLineIndex] = useState(0)
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
  const doChange = (i:number) => {
    setLineIndex(i);
  }
	return (
		<div>
			<ComponentBrowserCoinOverview coinPair={coinPair}></ComponentBrowserCoinOverview>
			<ComponentBrowserList listType={2} coinPair={coinPair}></ComponentBrowserList>
			<div className="linetype-tab1">
				{lineList.map((item, index) => {
					return <div key={index} className={classNames('linetype-tab1-item', lineIndex == index ? 'linetype-active' : '')} onClick={() => doChange(index)}>{item.name}</div>;
				})}
			</div>
			<ComponentBrowserTabList listType={lineList[lineIndex].type} token={coinPair}></ComponentBrowserTabList>
		</div>
	);
};

export default TokenInfo;

