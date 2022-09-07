import { FC, useState, useEffect } from 'react';
import classNames from 'classnames';
import { toolGet,toolApi } from '$tools';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [dataInfo,setDataInfo] = useState<dataType>(Object);
	useEffect(() => {
    if (coinPair) {
      getTopInfo();
    }
	}, [coinPair]);
  
  const getTopInfo = () => {
    toolGet(toolApi('/browser/token/info'), {token:coinPair}).then((res:any) => {
      if (res.errno==200) {
        setDataInfo(res.data)
      }
    })
  }
  const goLp = () => {
    navigate('/swap/poolsList');
  }
  const goSwap = () => {
    navigate('/swap/swap');
  }
  return (
    <div className="overview-info-detail">
      <div className="overview-info-title">
        <div className="overview-info-title-price">
        {dataInfo.name} ${dataInfo.price?.num}  
        {/* <span className="rate">({dataInfo.price?.change}%)</span> */}
        </div>
        <div className="overview-info-title-btns">
          <div className="overview-info-title-btns-item1 active" onClick={goLp}>{t('增加流动性')}</div>
          <div className="overview-info-title-btns-item1" onClick={goSwap}>{t('交易')}</div>
        </div>
      </div>
      <div className="overview-info">
        <div className="overview-info-item1">
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
            {t('pool')}
            </div>
            ${dataInfo.fluidity?.num} 
            {/* <span className="rate">({dataInfo.fluidity?.change}%)</span> */}
          </div>
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
            {t('tradNum')}
            </div>
            {dataInfo.trading?.num} <span className="rate">({dataInfo.trading?.change}%)</span>
          </div>
          <div className="overview-info-item1-value">
            <div className="overview-info-item1-tips">
            {t('turnover')}
            </div>
            ${Number(dataInfo.turnover?.num)}
             {/* <span className="rate">({dataInfo.turnover?.change}%)</span> */}
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserLpOverview; 
