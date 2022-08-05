import { FC, useState } from 'react';
import classNames from 'classnames';
import ComponentOverviewCharts from './charts';
import * as echarts from 'echarts';

import './index.scss';
interface tabType{
  tabName:string,
  tabId:number
}
const ComponentBrowserCoinOverview: FC<{
	coinPair?: string;
}> = ({
	coinPair
}) => {
  const option1 = {
    data: ['1', '2', '3', '4', '5', '6', '7','1', '2', '3', '4', '5', '6', '7','1', '2', '3', '4', '5', '6', '7','1', '2', '3', '4', '5', '6', '7','1', '2', '3', '4', '5', '6', '7','1', '2', '3', '4', '5', '6', '7'],
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130,120, 200, 150, 80, 70, 110, 130,120, 200, 150, 80, 70, 110, 130,120, 200, 150, 80, 70, 110, 130,120, 200, 150, 80, 70, 110, 130,120, 200, 150, 80, 70, 110, 130],
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
	const [tabIndex,setTabIndex] = useState(0)
  const tabList:Array<tabType> = [
    {
      tabName: 'Volume',
      tabId: 1
    },{
      tabName: 'TVL',
      tabId: 2
    },{
      tabName: 'Preice',
      tabId: 3
    }
  ]
  const doCheck = (i:number) => {
    setTabIndex(i)
  }

	return (
    <div className="overview-info-detail">
    <div className="overview-info-title">
      <div className="overview-info-title-price">
        $0.9978  <span className="rate">(+1.02%)</span>
      </div>
      <div className="overview-info-title-btns">
        <div className="overview-info-title-btns-item active">增加流动性</div>
        <div className="overview-info-title-btns-item">交易</div>
      </div>
    </div>
      <div className="overview-info">
        <div className="overview-info-item other">
          <div className="overview-info-item-value">
            <div className="overview-info-item-tips">
              总流动性
            </div>
            $156,989,766 <span className="rate">(2021.09.08)</span>
          </div>
          <div className="overview-info-item-item">
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
                总流动性
              </div>
              $156,989,766 <span className="rate">(2021.09.08)</span>
            </div>
            <div className="overview-info-item-value">
              <div className="overview-info-item-tips">
                总流动性
              </div>
              $156,989,766 <span className="rate">(2021.09.08)</span>
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
            <ComponentOverviewCharts option={option1} domId={'chartDom2'}></ComponentOverviewCharts>
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserCoinOverview; 
