import {FC, useEffect, useRef, useState} from "react";
import * as echarts from 'echarts';
import './index.scss';
type EChartsOption = echarts.EChartsOption;
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
const ComponentOverviewKline: FC<{
  optionValue: klineItem[],
  domId: string
  // onHoverChange?: Function;
  // onClickChange?: Function;
}> =  ({
  optionValue,
  domId
  // onHoverChange = () => { },onClickChange = () => { }
}) => {
  let chartId = domId
  // prettier-ignore

  function calculateMA(dayCount: number, data: klineItem[]) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data[i - j]['close'];
      }
      let fixedLength = 4;
      if (sum / dayCount < 0) fixedLength = 6;
      result.push(parseFloat((sum / dayCount).toFixed(fixedLength)));
    }
    return result;
  }
  const chartIns = useRef<any>(null)
  /**
   * 调用 resize  方法
   */
  const resizeAll = () => {
    chartIns.current.resize()
  }
  /**
   * 初始化图表组件
   */
  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        type: 'cross',
        lineStyle: {
          color: '#376df4',
          width: 2,
          opacity: 1
        }
      }
    },
    xAxis: {
      type: 'category',
      data: optionValue.map((item) => item.createTime),
      axisLine: { lineStyle: { color: '#8392A5' } }
    },
    yAxis: {
      scale: true,
      axisLine: { lineStyle: { color: '#8392A5' } },
      splitLine: { show: false }
    },
    // animation:false,
    grid: {
      top: 10,
      right: 30,
      bottom: 30,
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 60,
        end: 100
      }
    ],
    series: [
      {
        type: 'candlestick',
        name: 'Day',
        data: optionValue.map((item) => [
          item.open,
          item.close,
          item.low,
          item.high,
        ]),
        itemStyle: {
          color: '#31d87f',
          color0: '#f92640',
          borderColor: '#31d87f',
          borderColor0: '#f92640'
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5, optionValue),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, optionValue),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(20, optionValue),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: calculateMA(30, optionValue),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      }
    ]
  }
  useEffect(() => {
    const element = document.getElementById(chartId) as HTMLElement
    setTimeout(() => {
      chartIns.current = echarts.init(element)
      // chartIns.current.on('click', (params: any) => {
      //   onClickChange(params)
      // })
      // chartIns.current.on('mousemove', (params: any) => {
      //   onHoverChange(params)
      // })
      window.removeEventListener('resize', resizeAll)
      if (chartIns.current) {
        window.addEventListener('resize', resizeAll)
        chartIns.current.setOption(chartOption, true)
      }
    }, 20);
  }, [])
  /**
   * option 发生改变  
   */
  useEffect(() => {
    if (optionValue) {
      window.removeEventListener('resize', resizeAll)
      if (chartIns.current) {
        window.addEventListener('resize', resizeAll)
        chartIns.current.setOption(chartOption, true)
      }
    }
  }, [optionValue])

  return (
    <div className="chartDom" id={chartId} />
  )
};

export default ComponentOverviewKline