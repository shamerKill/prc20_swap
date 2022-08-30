import { FC, useState,useRef, useEffect } from 'react';
import classNames from 'classnames';
import ComponentOverviewCharts from './charts';
import ComponentOverviewKline from './kline';
import { useTranslation } from 'react-i18next';

import { toolApi,toolGet } from '$tools';
import * as echarts from 'echarts';

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
type klineItem = {
  close: number,
  high: number,
  low: number,
  lp_id: number,
  maxid: number,
  old: number,
  open: number,
  time: number,
  volume: number,
  createTime: string
}
interface tabType{
  tabName:string,
  tabId:number
}
const ComponentBrowserCoinOverview: FC<{
	coinPair: string;
}> = ({
	coinPair
}) => {
	const { t } = useTranslation();
	const [dataInfo,setDataInfo] = useState<dataType>(Object);
	const [optionValue,setOptionValue] = useState<klineItem[]>([]);
  let optionValues:klineItem[] = [];
	const [optionValue1,setOptionValue1] = useState<Array<string>>([]);
	const [optionDate1,setOptionDate1] = useState<Array<string>>([]);
	const [tabIndex,setTabIndex] = useState(0)
	const [lineIndex,setLineIndex] = useState(0)
  const ws = useRef<WebSocket | null>(null);
  const tabList:Array<tabType> = [
    {
      tabName: 'Price',
      tabId: 1
    },{
      tabName: 'Volume',
      tabId: 2
    },{
      tabName: 'TVL',
      tabId: 3
    }
  ]
  const lineList:string[] = ['1min','15min','30min','60min','1day','1week','1mon']
	useEffect(() => {
    if (coinPair) {
      getTopInfo();
      if (tabIndex == 1) {
        getVolumeData();
      } else if (tabIndex ==2) {
        getTvlData();
      } else {
        getPriceData();
      }
    }
	}, [coinPair]);
  useEffect(() => {
    if (tabIndex == 1) {
      getVolumeData();
    } else if (tabIndex ==2) {
      getTvlData();
    } else {
      getPriceData();
    }
	}, [tabIndex]);
  useEffect(() => {
    ws.current?.close();
    optionValues = [];
    setOptionValue([])
    getPriceData();
	}, [lineIndex]);
  
  const getTopInfo = () => {
    toolGet(toolApi('/browser/trading/info'), {token:coinPair}).then((res:any) => {
      if (res.errno==200) {
        setDataInfo(res.data)
      }
    })
  }
  const getVolumeData = () => {
    toolGet(toolApi('/browser/token/volume'),{token:coinPair}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          for (let index = 0; index < res.data.length; index++) {
            timeArr.push(res.data[index].day)
            dataArr.push(res.data[index].num)
          }
        }
        setOptionDate1(timeArr);
        setOptionValue1(dataArr);
      }
    })
  }
  const getTvlData = () => {
    toolGet(toolApi('/browser/token/tvl'),{token:coinPair}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          for (let index = 0; index < res.data.length; index++) {
            timeArr.push(res.data[index].day)
            dataArr.push(res.data[index].num)
          }
        }
        setOptionDate1(timeArr);
        setOptionValue1(dataArr);
      }
    })
  }

  const returnTime = (timeStr:number) => {
    return new Date(timeStr).toLocaleString().replace(/:\d{1,2}$/, '')
  }
  const connectWs = () => {
    console.log(optionValue)
    optionValues = optionValue
    ws.current = new WebSocket('ws://192.168.3.5:8554/marquee');
    ws.current.onopen = _e => {
      let infoStr = coinPair+','+lineList[lineIndex]+','+'v2';
      let sendInfo:any = {"type":"kline","data":infoStr}
      SendWsData(JSON.stringify(sendInfo))
    }
    ws.current.onerror = _e => connectWs();
    ws.current.onmessage = e => {
      let data = JSON.parse(e.data);
      SendWsData('ping')
      if (data.Type=='kline') {
        let infos:klineItem[] = [JSON.parse(data.Data)]
        if (optionValues) {
          if (optionValues[optionValues.length-1]?.time == infos[0].time) {
            optionValues[optionValues.length-1] = infos[0];
          } else {
            optionValues = optionValues.concat(infos);
          }
          setOptionValue(optionValues)
        }
      }
      };
  }
  const SendWsData = (data:string) => {
    ws.current?.send(data)
  }
  const getPriceData = () => {
    toolGet(toolApi('/kline'),{token:coinPair,date:lineList[lineIndex]}).then((res:any) => {
      if (res.errno==200) {
        if (res.data!=null) {
          let dataArr = res.data;
          dataArr.map((item:klineItem) => {
            item.createTime = returnTime(item.time)
          })
          optionValues = [];
          setOptionValue(dataArr.reverse())
        }
      }
    })
  }
  useEffect(() => {
    if (optionValue.length) {
      connectWs();
    }
  }, [optionValue]);
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
  const doCheck = (i:number) => {
    setTabIndex(i);
  }
  const doChange = (i:number) => {
    setLineIndex(i);
  }

	return (
    <div className="overview-info-detail">
    <div className="overview-info-title">
      <div className="overview-info-title-price">
        ${dataInfo.price?.num}  <span className="rate">({dataInfo.price?.change}%)</span>
      </div>
      <div className="overview-info-title-btns">
        <div className="overview-info-title-btns-item active">{t('增加流动性')}</div>
        <div className="overview-info-title-btns-item">{t('交易')}</div>
      </div>
    </div>
      <div className="overview-info">
        <div className="overview-info-item other">
          <div className="overview-info-item-value">
            <div className="overview-info-item-tips">
            {t('liquidity')}
            </div>
            ${dataInfo.fluidity?.num} <span className="rate">({dataInfo.fluidity?.change}%)</span>
          </div>
          <div className="overview-info-item-item">
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
              {t('tradNum')}
              </div>
              ${dataInfo.trading?.num} <span className="rate">({dataInfo.trading?.change}%)</span>
            </div>
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
              {t('turnover')}
              </div>
              ${dataInfo.turnover?.num} <span className="rate">({dataInfo.turnover?.change}%)</span>
            </div>

          </div>
        </div>
        <div className="overview-info-item other">
          <div className="overview-info-item-title">
            <div className="overview-info-item-value">
              $156,989,766 <span className="rate">(2021.09.08)</span>
            </div>
            <div className="overview-info-item-tab">
              {tabList.map((item, index) => {
                  return <div key={index} className={classNames('overview-info-item-tab-item', tabIndex == index ? 'item-active':'')} onClick={() => doCheck(index)}>{item.tabName}</div>
              })}
            </div>
          </div>
          <div className="overview-charts-list-item">
            {
              tabIndex==0&&
             <><div className="linetype-tab">
                {lineList.map((item, index) => {
                  return <div key={index} className={classNames('linetype-tab-item', lineIndex == index ? 'linetype-active' : '')} onClick={() => doChange(index)}>{item}</div>;
                })}
              </div><ComponentOverviewKline optionValue={optionValue} domId={'chartDom2'}></ComponentOverviewKline></>
            }
            {
              tabIndex!=0&&<ComponentOverviewCharts option={option1} domId={'chartDom2'}></ComponentOverviewCharts>
            }
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserCoinOverview; 