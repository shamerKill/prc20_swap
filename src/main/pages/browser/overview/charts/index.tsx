import {FC, useEffect, useRef, useState} from "react";
import * as echarts from 'echarts';
import './index.scss';
type EChartsOption = echarts.EChartsOption;
const ComponentOverviewCharts: FC<{
  option: EChartsOption,
  domId: string
  // onHoverChange?: Function;
  // onClickChange?: Function;
}> =  ({
  option,
  domId
  // onHoverChange = () => { },onClickChange = () => { }
}) => {
  let chartId = domId
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
    xAxis: {
      type: 'category',
      data: option.data,
      axisLine:{
        show:false //y轴线消失
      },
      axisTick: {
        show: false
      }
    },
    animation:false,
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      left: 30,
      top: 30,
      right: 30,
      bottom: 30,
    },
    series: option.series,
    tooltip: {
      show: true
    }
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
    window.removeEventListener('resize', resizeAll)
    if (chartIns.current) {
      window.addEventListener('resize', resizeAll)
      chartIns.current.setOption(chartOption, true)
    }
  }, [option])

  return (
    <div className="chartDom" id={chartId} />
  )
};

export default ComponentOverviewCharts