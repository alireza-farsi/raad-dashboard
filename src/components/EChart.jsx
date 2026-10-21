import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * EChart — custom React wrapper around Apache ECharts 6 (REBUILT).
 *
 * Design goals (all born from real bugs we hit):
 *
 *  1. NEVER freeze on hover. The original freeze came from merge-mode
 *     `setOption` leaving stale internal state after data/props changes.
 *     This wrapper always applies options with:
 *        notMerge: true                 → full option replace
 *        replaceMerge: ['series', ...]  → old series/axes are dropped,
 *                                         never merged with new ones
 *     so the chart's internal model exactly mirrors the latest props.
 *
 *  2. Canvas renderer. Crisp, performant hover/tooltips, and the safest
 *     path for html2canvas PDF export.
 *
 *  3. Resize correctness. One ResizeObserver per instance, disconnected
 *     on unmount; charts re-flow when the sidebar/layout changes.
 *
 *  4. Clean lifecycle. Instance is disposed on unmount and every callback
 *     guards against a disposed chart, so rapid page/year switching can
 *     never leave orphaned handlers behind (another freeze source).
 *
 *  5. Guarded updates. `setOption` runs only when the instance is alive
 *     and the option actually changed (identity check) — no wasted work
 *     while typing/hovering/scrolling.
 */
export default function EChart({ option, style, className, onReady }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const optionRef = useRef(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // ---- create once -------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const chart = echarts.init(el, null, { renderer: 'canvas' });
    chartRef.current = chart;

    if (onReadyRef.current) onReadyRef.current(chart);

    const observer = new ResizeObserver(() => {
      const c = chartRef.current;
      if (c && !c.isDisposed() && el.offsetWidth > 0 && el.offsetHeight > 0) {
        c.resize();
      }
    });
    observer.observe(el);

    // apply the first option immediately after init
    if (optionRef.current) {
      chart.setOption(optionRef.current, {
        notMerge: true,
        replaceMerge: ['series', 'xAxis', 'yAxis'],
      });
    }

    return () => {
      observer.disconnect();
      if (chart && !chart.isDisposed()) chart.dispose();
      chartRef.current = null;
      optionRef.current = null;
    };
  }, []);

  // ---- apply options on change (full replace) ----------------------------
  useEffect(() => {
    optionRef.current = option;
    const chart = chartRef.current;
    if (!chart || !option || chart.isDisposed()) return;
    chart.setOption(option, {
      notMerge: true,
      replaceMerge: ['series', 'xAxis', 'yAxis', 'legend', 'dataZoom'],
    });
  }, [option]);

  return <div ref={containerRef} className={`echart-root${className ? ` ${className}` : ''}`} style={style} />;
}
