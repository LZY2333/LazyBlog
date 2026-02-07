---
title: React.lazy / Suspense
date: 2026-01-22 11:23:09
categories: 技术栈
tags:
  - React
---


## Demo加载Echarts

```js
// Chart.tsx
import { useEffect, useRef } from 'react';

export default function Chart() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let chart: any;

        import('echarts/core').then(async (echarts) => {
            const { LineChart } = await import('echarts/charts');
            const { GridComponent, TooltipComponent } = await import('echarts/components');
            const { CanvasRenderer } = await import('echarts/renderers');

            echarts.use([
                LineChart,
                GridComponent,
                TooltipComponent,
                CanvasRenderer,
            ]);

            chart = echarts.init(ref.current!);
            chart.setOption({
                xAxis: { type: 'category', data: ['Mon', 'Tue'] },
                yAxis: { type: 'value' },
                series: [{ type: 'line', data: [120, 200] }],
            });
        });

        return () => chart?.dispose();
    }, []);

    return <div ref={ref} style={{ height: '400px', width: '100%' }} />;
}
```

```js
// LazyECharts.tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('./Chart'));

export default function LazyECharts() {
    return (
        <Suspense fallback={<div>图表加载中...</div>}>
            <Chart />
        </Suspense>
    );
}
```

