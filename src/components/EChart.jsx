import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * Custom ECharts wrapper for React 19 + ECharts 6.
 *
 * Why not `echarts-for-react`?
 *  - It calls setOption in MERGE mode by default (notMerge: false). After
 *    switching years/pages the merged internal state gets stale and the chart
 *    stops responding to hover (tooltip freezes on screen / pointer events
 *    dead). This was the "chart freezes when I hover" bug.
 *  - It relies on the deprecated `size-sensor` package for resize handling.
 *
 * This wrapper:
 *  - always applies options with notMerge: true + replaceMerge: ['series']
 *    so every update produces a clean, predictable chart state
 *  - disposes the instance properly on unmount (no orphan DOM listeners)
 *  - uses a single ResizeObserver for container-aware resizing
 *  - renders with the SVG renderer (crisp at any DPI, exports cleanly)
 */
export default function EChart({ option, style, className, onReady }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  // Create / dispose the instance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const chart = echarts.init(el, null, { renderer: 'svg' });
    chartRef.current = chart;
    if (onReady) onReady(chart);

    const observer = new ResizeObserver(() => {
      // Guard against resize during unmount
      if (chartRef.current && !chart.isDisposed()) {
        chart.resize();
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply options — full replace so no stale state can survive
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !option) return;
    // chart might have been created in the same render cycle
    if (chart.isDisposed()) return;
    chart.setOption(option, { notMerge: true, replaceMerge: ['series', 'xAxis', 'yAxis'] });
  }, [option]);

  return <div ref={containerRef} className={className} style={style} />;
}
