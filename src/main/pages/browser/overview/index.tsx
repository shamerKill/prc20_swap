import { FC } from 'react';
import ComponentOverviewCharts from './charts';
import * as echarts from 'echarts';

import './index.scss';

const ComponentBrowserOverview: FC<{
	coinPair?: string;
}> = ({
	coinPair
}) => {
  let option = {
    data: ['1', '2', '3', '4', '5', '6', '7'],
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
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
  const option1 = {
    data: ['1', '2', '3', '4', '5', '6', '7'],
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
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
	return (
    <div className="overview-info">
      <div className="browser-overview">
        <div className="info-item">
          <div className="info-title"><div className="coin-name">{coinPair?.toLocaleUpperCase()}</div> 价格:</div>
          <div className="info-value"> $ 0.0841</div>
        </div>
        <div className="info-item">
          <div className="info-title">总交易对:</div>
          <div className="info-value"> 1,004</div>
        </div>
        <div className="info-item">
          <div className="info-title">交易数(24H) :</div>
          <div className="info-value"> 751,898</div>
        </div>
        <div className="info-item">
          <div className="info-title">新交易对(24H) :</div>
          <div className="info-value"> 3</div>
        </div>
      </div>
      <div className="overview-info-detail">
        <div className="overview-info-title">
          <div className="overview-info-title-item">
            <div className="overview-info-title-item-title">
              资产流动性
            </div>
            <div className="overview-info-title-item-value">
              $156,989,766 <span className="rate">+0.08%</span>
            </div>
          </div>
          <div className="overview-info-title-item">
            <div className="overview-info-title-item-title">
              24H 成交额
            </div>
            <div className="overview-info-title-item-value">
              $156,989,766 <span className="rate">+0.08%</span>
            </div>
          </div>
        </div>
        <div className="overview-charts-list">
          <div className="overview-charts-list-item">
            <ComponentOverviewCharts option={option} domId={'chartDom1'}></ComponentOverviewCharts>
          </div>
          <div className="overview-charts-list-item">
            <ComponentOverviewCharts option={option1} domId={'chartDom2'}></ComponentOverviewCharts>
          </div>
        </div>
      </div>
    </div>
	);
};
export default ComponentBrowserOverview; 
