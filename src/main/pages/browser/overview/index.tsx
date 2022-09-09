import { FC, useEffect,useState,useRef } from 'react';
import ComponentOverviewCharts from './charts';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts';
import { toolApi,toolGet } from '$tools';
import { useCustomGetAppVersion } from '$hooks';
import { TypeAppVersion } from '$types';
import { toNonExponential } from '$tools';



import './index.scss';
type dataType = {
  new_trading_pair: number,
  price: string,
  trading: number,
  trading_pair: number
}
const ComponentBrowserOverview: FC<{
	coinPair?: string;
}> = ({
	coinPair
}) => {
	const { t } = useTranslation();
	const [ appVersion ] = useCustomGetAppVersion();
	let versoins = useRef<TypeAppVersion>();
	const [dataInfo,setDataInfo] = useState<dataType>(Object);
	const [chartType,setChartType] = useState<'day'|'week'>('day');
	const [optionValue,setOptionValue] = useState<Array<string>>([]);
	const [optionDate,setOptionDate] = useState<Array<string>>([]);
	const [optionValue1,setOptionValue1] = useState<Array<string>>([]);
	const [optionDate1,setOptionDate1] = useState<Array<string>>([]);
  let option = {
    data: optionDate,
    series: [
      {
        data: optionValue,
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              {offset: 0, color: 'rgba(242,41,70,1)'},
              {offset: 0.5, color: 'rgba(242,41,70,0.1)'},
              {offset: 1, color: 'rgba(242,41,70,0)'}
            ]
          )
        },
        itemStyle: {
          color:'#F22946',  
          lineStyle:{  
            color:'#F22946'  
          }  
        }
      }
    ],
  };
  let option1 = {
    data: optionDate1,
    series: [
      {
        data: optionValue1,
        type: 'bar',
        itemStyle: {
          color:'#31D87F',  
          lineStyle:{  
            color:'#31D87F'  
          }  
        }
      }
    ],
  };
	useEffect(() => {
    if (coinPair == 'pc'&&chartType&&appVersion) {
      getTopInfo();
      getChart();
    }
	}, [coinPair,appVersion,chartType]);
  const getTopInfo = () => {
    toolGet(toolApi('/browser/home/info'),{version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        setDataInfo(res.data)
      }
    })
  }
  const getChart = () => {
    toolGet(toolApi('/browser/home/fluidity'),{date:chartType,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          let beforeArr:any = res.data.reverse();
          for (let index = 0; index < beforeArr.length; index++) {
            timeArr.push(beforeArr[index].day.substr(-4))
            dataArr.push(beforeArr[index].num)
          }
        }
        setOptionDate(timeArr);
        setOptionValue(dataArr);
      }
    })
    toolGet(toolApi('/browser/home/turnover'),{date:chartType,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          let beforeArr:any = res.data.reverse();
          for (let index = 0; index < beforeArr.length; index++) {
            timeArr.push(beforeArr[index].day.substr(-4))
            dataArr.push(beforeArr[index].num)
          }
        }
        setOptionDate1(timeArr);
        setOptionValue1(dataArr);
      }
    })
  }
  const doCheck = (type:'day'|'week') => {
    if (type == chartType) return
    setChartType(type);
  }
	return (
    <div className="overview-info">
      <div className="browser-overview">
        <div className="info-item">
          <div className="info-title"><div className="coin-name">{coinPair?.toLocaleUpperCase()}</div> {t('browser-price')}:</div>
          <div className="info-value"> $ {dataInfo.price}</div>
        </div>
        <div className="info-item">
          <div className="info-title">{t('totalTrading')}:</div>
          <div className="info-value"> {dataInfo.trading_pair}</div>
        </div>
        <div className="info-item">
          <div className="info-title">{t('tradNum')}(24H) :</div>
          <div className="info-value"> {dataInfo.trading}</div>
        </div>
        <div className="info-item">
          <div className="info-title">{t('newTrading')}(24H) :</div>
          <div className="info-value"> {dataInfo.new_trading_pair}</div>
        </div>
      </div>
      <div className="overview-info-detail">
        <div className="overview-info-title">
          <div className="overview-info-title-item">
            <div className="overview-info-title-item-title">
            {t('liquidity')}
            </div>
            <div className="overview-info-title-item-value">
              ${toNonExponential(optionValue[optionValue.length-1]) ? toNonExponential(optionValue[optionValue.length-1]) : '0'} <span className="rate">{Number(optionValue[optionValue.length-2]) ? (((Number(optionValue[optionValue.length-1])-Number(optionValue[optionValue.length-2]))/Number(optionValue[optionValue.length-2]))*100).toFixed(2) : toNonExponential(optionValue[optionValue.length-1]) ? '100' : '0'}%</span>
            </div>
          </div>
          <div className="overview-info-title-item other">
            <div className="flex-item">
              <div className="overview-info-title-item-title">
                24H {t('turnover')}
              </div>
              <div className="overview-info-title-item-value">
                ${Number(optionValue1[optionValue1.length-1]) ? toNonExponential(optionValue1[optionValue1.length-1]) : '0'} <span className="rate">{Number(optionValue1[optionValue1.length-2]) ? (((Number(optionValue1[optionValue1.length-1])-Number(optionValue1[optionValue1.length-2]))/Number(optionValue1[optionValue1.length-2]))*100).toFixed(2) : toNonExponential(optionValue1[optionValue1.length-1]) ? '100' : '0'}%</span>
              </div>
            </div>
            <div className="flex-item">
              <div className="overview-info-title-btns">
                <div className={classNames('overview-info-title-btns-item', chartType == 'day' ? 'active':'')} onClick={() => doCheck('day')}>{t('每天')}</div>
                <div className={classNames('overview-info-title-btns-item', chartType == 'week' ? 'active1':'')} onClick={() => doCheck('week')}>{t('每周')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="overview-charts-list">
          <div className="overview-charts-list-item1">
            <ComponentOverviewCharts option={option} domId={'chartDom1'}></ComponentOverviewCharts>
          </div>
          <div className="overview-charts-list-item1">
            <ComponentOverviewCharts option={option1} domId={'chartDom2'}></ComponentOverviewCharts>
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserOverview; 
