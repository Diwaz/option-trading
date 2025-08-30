import React, { useEffect, useRef } from "react";
import { createChart, CrosshairMode, IChartApi } from "lightweight-charts";

import { priceData } from "./priceData";
import { volumeData } from "./volumeData";

const CandleStickChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // ✅ create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        backgroundColor: "#253248",
        textColor: "rgba(255, 255, 255, 0.9)",
      },
      grid: {
        vertLines: { color: "#334158" },
        horzLines: { color: "#334158" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      priceScale: { borderColor: "#485c7b" },
      timeScale: { borderColor: "#485c7b" },
    });

    chartRef.current = chart;

    // ✅ candlestick
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#4bffb5",
      downColor: "#ff4976",
      borderDownColor: "#ff4976",
      borderUpColor: "#4bffb5",
      wickDownColor: "#838ca1",
      wickUpColor: "#838ca1",
    });

    candleSeries.setData(priceData);

    // ✅ volume histogram
    const volumeSeries = chart.addHistogramSeries({
      color: "#182233",
      lineWidth: 2,
      priceFormat: { type: "volume" },
      overlay: true,
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(volumeData);

    // ✅ cleanup on unmount
    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !chartRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chartRef.current?.applyOptions({ width, height });
      setTimeout(() => {
        chartRef.current?.timeScale().fitContent();
      }, 0);
    });

    resizeObserver.current.observe(chartContainerRef.current);

    return () => resizeObserver.current?.disconnect();
  }, []);

  return (
    <div>
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
};

export default CandleStickChart;
