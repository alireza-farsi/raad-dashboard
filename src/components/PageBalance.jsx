import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import { PALETTE, baseGrid, baseTooltip, baseLegend, faValueAxis, faCategoryAxis, FONT } from '../utils/echartsTheme';

// Page 4 of the PDF: "ترازنامه"
// Compact layout — everything fits on one screen:
//   Top: two side-by-side balance-sheet tables (liabs+equity on the right,
//        assets on the left) with 4 year columns each
//   Bottom: two trend charts side-by-side
//        1) روند حساب‌های پرداختنی، دریافتی و تسهیلات مالی
//        2) روند تغییرات سرمایه در گردش به ترند دارایی‌ها

const BALANCE_YEARS = ['1400', '1401', '1402', '1403'];
const TREND_YEARS = ['1396', '1397', '1398', '1399', '1400', '1401', '1402', '1403', '1404'];

const LEFT_GROUPS = [
  {
    title: 'حقوق مالکانه',
    items: [
      { key: 'legalReserve', label: 'ذخیره قانونی' },
      { key: 'stock', label: 'سرمایه ثبتی' },
      { key: 'retainedEarnings', label: 'سود (زیان) انباشت' },
      { key: 'equities', label: 'جمع حقوق مالکانه', type: 'subtotal' },
    ],
  },
  {
    title: 'بدهی های غیرجاری',
    items: [
      { key: 'longTermLoans', label: 'تسهیلات بلندمدت' },
      { key: 'longTermLiabilities', label: 'حساب‌ها و بدهی‌های بلندمدت' },
      { key: 'longTermLiabilities', label: 'جمع بدهی های غیرجاری', type: 'subtotal',
        aggregate: (b) => (b?.longTermLoans ?? 0) + (b?.longTermLiabilities ?? 0) || null,
      },
    ],
  },
  {
    title: 'بدهی های جاری',
    items: [
      { key: 'accountsPayable', label: 'حساب‌های پرداختنی' },
      { key: 'otherAccountsPayable', label: 'سایر حساب‌های پرداختنی' },
      { key: 'shortTermLoans', label: 'تسهیلات مالی کوتاه‌مدت' },
      { key: 'advances', label: 'پیش‌دریافت‌ها' },
      { key: 'sap', label: 'جاری شرکا' },
      { key: 'otherCurrentLiabilities', label: 'سایر بدهی‌های جاری' },
      { key: 'totalCurrentLiabilities', label: 'جمع بدهی های جاری', type: 'subtotal' },
    ],
  },
  {
    title: '',
    items: [
      { key: 'totalLiabAndEquity', label: 'جمع حقوق مالکانه و بدهی ها', type: 'total' },
    ],
  },
];

const RIGHT_GROUPS = [
  {
    title: 'دارایی های غیرجاری',
    items: [
      { key: 'tangibleFixedAssets', label: 'دارایی ثابت مشهود' },
      { key: 'intangibleFixedAssets', label: 'دارایی ثابت نامشهود' },
      { key: 'totalFixedAssets', label: 'جمع دارایی های غیرجاری', type: 'subtotal',
        aggregate: (b) => (b?.tangibleFixedAssets ?? 0) + (b?.intangibleFixedAssets ?? 0)
          + (b?.longTermInvestment ?? 0) + (b?.ofa ?? 0) || null,
      },
    ],
  },
  {
    title: 'دارایی های جاری',
    items: [
      { key: 'prepayments', label: 'پیش‌پرداخت‌ها' },
      { key: 'inventory', label: 'موجودی مواد و کالا' },
      { key: 'accountsReceivable', label: 'حساب‌های دریافتنی' },
      { key: 'otherAccountsReceivable', label: 'سایر حساب‌های دریافتنی' },
      { key: 'sap', label: 'جاری شرکا' },
      { key: 'cash', label: 'موجود نقد و بانک' },
      { key: 'shortTermInvestments', label: 'سرمایه‌گذاری‌های کوتاه‌مدت' },
      { key: 'oca', label: 'سایر دارایی‌های جاری' },
      { key: 'totalCurrentAssets', label: 'جمع دارایی های جاری', type: 'subtotal' },
    ],
  },
  {
    title: '',
    items: [
      { key: 'totalAssets', label: 'جمع دارایی‌ها', type: 'total' },
    ],
  },
];

export default function PageBalance({ balance, year, allBalances }) {
  const payRecvTrendOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['حساب‌های پرداختنی', 'حساب‌های دریافتنی', 'تسهیلات مالی'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'حساب‌های پرداختنی',
        type: 'line',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAccountsPayable ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'حساب‌های دریافتنی',
        type: 'line',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAccountsReceivable ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'تسهیلات مالی',
        type: 'line',
        data: TREND_YEARS.map((y) =>
          (allBalances[y]?.shortTermLoans ?? 0) + (allBalances[y]?.longTermLoans ?? 0) || null
        ),
        smooth: true, symbol: 'diamond', symbolSize: 5,
        lineStyle: { color: PALETTE.gold, width: 2.5 },
        itemStyle: { color: PALETTE.gold },
      },
    ],
  }), [allBalances]);

  const wcAssetsTrendOption = useMemo(() => ({
    grid: { ...baseGrid, top: 40, bottom: 30 },
    tooltip: { ...baseTooltip },
    legend: { ...baseLegend, data: ['دارایی‌های جاری', 'مجموع دارایی‌ها', 'سرمایه در گردش'] },
    xAxis: { type: 'category', data: TREND_YEARS, ...faCategoryAxis() },
    yAxis: { type: 'value', ...faValueAxis({ compact: false, decimals: 0 }), name: 'میلیارد تومان', nameTextStyle: { fontFamily: FONT, color: PALETTE.inkSoft, fontSize: 10 } },
    series: [
      {
        name: 'دارایی‌های جاری',
        type: 'line',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalCurrentAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.teal, width: 2.5 },
        itemStyle: { color: PALETTE.teal },
      },
      {
        name: 'مجموع دارایی‌ها',
        type: 'line',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAssets ?? null),
        smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { color: PALETTE.tealDark, width: 2.5 },
        itemStyle: { color: PALETTE.tealDark },
      },
      {
        name: 'سرمایه در گردش',
        type: 'line',
        data: TREND_YEARS.map((y) => {
          const ca = allBalances[y]?.totalCurrentAssets;
          const cl = allBalances[y]?.totalCurrentLiabilities;
          if (ca === null || ca === undefined || cl === null || cl === undefined) return null;
          return ca - cl;
        }),
        smooth: true, symbol: 'diamond', symbolSize: 5,
        lineStyle: { color: PALETTE.gold, width: 2.5, type: 'dashed' },
        itemStyle: { color: PALETTE.gold },
      },
    ],
  }), [allBalances]);

  return (
    <div className="page-inner">
      {/* Top: two side-by-side tables */}
      <div className="grid-2col" style={{ alignItems: 'stretch' }}>
        <div className="card">
          <table className="statement-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>شرح</th>
                {BALANCE_YEARS.map((y) => (
                  <th key={y} className="num" style={{ width: `${50 / BALANCE_YEARS.length}%` }}>
                    {toFa(y)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEFT_GROUPS.map((g, gi) => (
                <GroupRows key={gi} group={g} allBalances={allBalances} years={BALANCE_YEARS} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <table className="statement-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>شرح</th>
                {BALANCE_YEARS.map((y) => (
                  <th key={y} className="num" style={{ width: `${50 / BALANCE_YEARS.length}%` }}>
                    {toFa(y)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RIGHT_GROUPS.map((g, gi) => (
                <GroupRows key={gi} group={g} allBalances={allBalances} years={BALANCE_YEARS} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="unit-note" style={{ marginTop: 4, marginBottom: 8 }}>
        تمامی ارقام به میلیارد تومان می‌باشد.
      </div>

      {/* Bottom: two charts side-by-side */}
      <div className="grid-2col">
        <div className="chart-card compact">
          <div className="chart-title compact">روند حساب‌های پرداختنی، دریافتی و تسهیلات مالی</div>
          <EChart option={payRecvTrendOption} style={{ height: 220 }} />
        </div>
        <div className="chart-card compact">
          <div className="chart-title compact">روند تغییرات سرمایه در گردش به ترند دارایی‌ها</div>
          <EChart option={wcAssetsTrendOption} style={{ height: 220 }} />
        </div>
      </div>
    </div>
  );
}

function GroupRows({ group, allBalances, years }) {
  return (
    <>
      {group.title && (
        <tr className="subtotal">
          <td colSpan={years.length + 1} style={{ background: 'var(--cream-light)', color: 'var(--teal-dark)', fontWeight: 600, fontSize: 11.5 }}>
            {group.title}
          </td>
        </tr>
      )}
      {group.items.map((it) => {
        const isTotal = it.type === 'total';
        const isSubtotal = it.type === 'subtotal';
        return (
          <tr key={it.key + it.label} className={isTotal ? 'total' : isSubtotal ? 'subtotal' : ''}>
            <td>
              <div className="row-label">
                <span className="indent-1" />
                {it.label}
              </div>
            </td>
            {years.map((y) => {
              const v = it.aggregate
                ? it.aggregate(allBalances[y])
                : allBalances[y]?.[it.key];
              return (
                <td key={y} className="num">{formatNum(v)}</td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function formatNum(v) {
  if (v === null || v === undefined) return '۰';
  const n = Number(v);
  if (Number.isNaN(n)) return '۰';
  return toFa(Math.round(n).toLocaleString('en-US'));
}
