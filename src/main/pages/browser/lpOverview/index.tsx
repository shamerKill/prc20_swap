import { FC, useState,useRef, useEffect } from 'react';
import classNames from 'classnames';
import ComponentOverviewCharts from './charts';
import ComponentOverviewKline from './kline';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { toolApi,toolApiKline,toolGet } from '$tools';
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
  token: [
    {
      logo: string,
      name: string,
      token: string,
    },{
      logo: string,
      name: string,
      token: string,
    }
  ],
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
	const navigate = useNavigate();
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
      ws.current?.close();
      optionValues = [];
      setOptionValue([])
      if (tabIndex == 1) {
        getVolumeData();
      } else if (tabIndex ==2) {
        getTvlData();
      } else {
        getPriceData();
      }
    }
	}, [coinPair,tabIndex]);
  useEffect(() => {
    ws.current?.close();
    optionValues = [];
    setOptionValue([])
    getPriceData();
	}, [lineIndex]);
  
  const getTopInfo = () => {
    toolGet(toolApi('/browser/trading/info'), {token:coinPair,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        setDataInfo(res.data)
      }
    })
  }
  const getVolumeData = () => {
    toolGet(toolApi('/browser/token/volume'),{token:coinPair,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          for (let index = 0; index < res.data.length; index++) {
            timeArr.push(res.data[index].day)
            dataArr.push(res.data[index].num)
          }
        }
        setOptionDate1(timeArr.reverse());
        setOptionValue1(dataArr.reverse());
      }
    })
  }
  const getTvlData = () => {
    toolGet(toolApi('/browser/token/tvl'),{token:coinPair,version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
      if (res.errno==200) {
        let timeArr = []
        let dataArr = [];
        if (res.data!=null) {
          for (let index = 0; index < res.data.length; index++) {
            timeArr.push(res.data[index].day)
            dataArr.push(res.data[index].num)
          }
        }
        setOptionDate1(timeArr.reverse());
        setOptionValue1(dataArr.reverse());
      }
    })
  }

  const returnTime = (timeStr:number) => {
    return new Date(timeStr).toLocaleString().replace(/:\d{1,2}$/, '')
  }
  const connectWs = () => {
    optionValues = optionValue
    ws.current = new WebSocket('wss://api.gxswap.io/kline/marquee');
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
    toolGet(toolApiKline('/kline'),{token:coinPair,date:lineList[lineIndex],version:localStorage.getItem('cosmo_swap_version')?localStorage.getItem('cosmo_swap_version')!:'v2'}).then((res:any) => {
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
  const goLp = () => {
    navigate(`/swap/poolsList/add?one=${dataInfo.token[0].token}&two=${dataInfo.token[1].token}`);
  }
  const goSwap = () => {
    navigate(`/swap/swap?one=${dataInfo.token[0].token}&two=${dataInfo.token[1].token}`);
  }
	return (
    <div className="overview-info-detail">
    <div className="overview-info-title">
      <div className="overview-info-title-price">
      {dataInfo.token ?dataInfo.token[0]?.name :''} / {dataInfo.token?dataInfo.token[1]?.name:''}  (${dataInfo.price?.num})  
        {/* <span className="rate">({dataInfo.price?.change}%)</span> */}
      </div>
      <div className="overview-info-title-btns">
        <div className="overview-info-title-btns-item2 active" onClick={goLp}>{t('增加流动性')}</div>
        <div className="overview-info-title-btns-item2" onClick={goSwap}>{t('交易')}</div>
      </div>
    </div>
      <div className="overview-info lpinfos">
        <div className="overview-info-item lpinfo">
          <div className="overview-info-item-value">
            <div className="overview-info-item-tips">
            {t('liquidity')}
            </div>
            ${dataInfo.fluidity?.num} 
            {/* <span className="rate">({dataInfo.fluidity?.change}%)</span> */}
          </div>
          <div className="overview-info-item-item">
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
              {t('tradNum')}
              </div>
              {dataInfo.trading?.num} <span className="rate">({dataInfo.trading?.change}%)</span>
            </div>
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
              {t('turnover')}
              </div>
              ${dataInfo.turnover?.num} 
              {/* <span className="rate">({dataInfo.turnover?.change}%)</span> */}
            </div>

          </div>
        </div>
        <div className="overview-info-item lpinfo">
          <div className="overview-info-item-title">

            {
              tabIndex!=0&&<div className="overview-info-item-value">
              ${option1.series[0].data[option1.series[0].data.length-1] ? Number(option1.series[0].data[option1.series[0].data.length-1]):'0'} <span className="rate">({option1.data[option1.data.length-1]})</span>
            </div>
            }
            {
              tabIndex==0&&<div className="overview-info-item-value">
              ${optionValue ? optionValue[optionValue.length-1]?.close : ''} <span className="rate">({optionValue?optionValue[optionValue.length-1]?.createTime:''})</span>
            </div>
            }
            <div className="overview-info-item-tab">
              {tabList.map((item, index) => {
                  return <div key={index} className={classNames('overview-info-item-tab-item', tabIndex == index ? 'item-active':'')} onClick={() => doCheck(index)}>{item.tabName}</div>
              })}
            </div>
          </div>
          {
            tabIndex==0&&
            <><div className="linetype-tab">
              {lineList.map((item, index) => {
                return <div key={index} className={classNames('linetype-tab-item', lineIndex == index ? 'linetype-active' : '')} onClick={() => doChange(index)}>{item}</div>;
              })}
            </div></>
          }
          <div className="overview-charts-list-item">
            {
              tabIndex==0&&<ComponentOverviewKline optionValue={optionValue} domId={'chartDom2'}></ComponentOverviewKline>
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