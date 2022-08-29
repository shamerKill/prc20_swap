import { FC, useState, useEffect } from 'react';
import classNames from 'classnames';
import { toolGet } from '$tools';

import './index.scss';
type dataType = {
  fluidity: {
    change: string,
    num: string
  },
  logo: string,
  name: string,
  price: {
    change: string,
    num: string
  },
  token: string,
  trading: {
    change: string,
    num: string
  },
  turnover: {
    change: string,
    num: string
  }
}
interface tabType{
  tabName:string,
  tabId:number
}
const ComponentBrowserLpOverview: FC<{
	coinPair: string;
}> = ({
	coinPair
}) => {
	const [dataInfo,setDataInfo] = useState<dataType>(Object);
	useEffect(() => {
    if (coinPair) {
      getTopInfo();
    }
	}, [coinPair]);
  
  const getTopInfo = () => {
    toolGet(':8552/browser/token/info', {token:coinPair}).then((res:any) => {
      if (res.errno==200) {
        setDataInfo(res.data)
      }
    })
  }
  
  return (
    <div className="overview-info-detail">
      <div className="overview-info-title">
        <div className="overview-info-title-price">
        {dataInfo.name} ${dataInfo.price?.num}  <span className="rate">({dataInfo.price?.change}%)</span>
        </div>
        <div className="overview-info-title-btns">
          <div className="overview-info-title-btns-item active">增加流动性</div>
          <div className="overview-info-title-btns-item">交易</div>
        </div>
      </div>
      <div className="overview-info">
        <div className="overview-info-item1">
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
              总流动性
            </div>
            ${dataInfo.fluidity?.num} <span className="rate">({dataInfo.fluidity?.change}%)</span>
          </div>
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
              交易数
            </div>
            ${dataInfo.trading?.num} <span className="rate">({dataInfo.trading?.change}%)</span>
          </div>
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
              成交额
            </div>
            ${dataInfo.turnover?.num} <span className="rate">({dataInfo.turnover?.change}%)</span>
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserLpOverview; 
