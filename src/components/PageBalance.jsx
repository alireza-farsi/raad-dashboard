import EChart from './EChart';
import { useMemo } from 'react';
import { toFa } from '../utils/format';
import {
  PALETTE, makeGrid, makeTooltip, makeLegend, valueAxis, categoryAxis,
  lineSeries, faNum,
} from '../utils/echartsTheme';

// Page 4 of the PDF: "ترازنامه"
// Compact layout — everything fits on one screen:
//   Top: two side-by-side balance-sheet tables (liabs+equity on the right,
//        assets on the left) with 4 year columns each
//   Bottom: two REBUILT trend charts side-by-side (gradient area lines)
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
  // ── Chart 1 (REBUILT): payables / receivables / facilities — area lines ──
  const payRecvTrendOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['حساب‌های پرداختنی', 'حساب‌های دریافتنی', 'تسهیلات مالی']),
    xAxis: categoryAxis(TREND_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'حساب‌های پرداختنی',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAccountsPayable ?? null),
        color: PALETTE.slate,
        area: true,
      }),
      lineSeries({
        name: 'حساب‌های دریافتنی',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAccountsReceivable ?? null),
        color: PALETTE.teal,
        area: true,
      }),
      lineSeries({
        name: 'تسهیلات مالی',
        data: TREND_YEARS.map((y) =>
          (allBalances[y]?.shortTermLoans ?? 0) + (allBalances[y]?.longTermLoans ?? 0) || null
        ),
        color: PALETTE.gold,
        dashed: true,
        symbol: 'diamond',
      }),
    ],
  }), [allBalances]);

  // ── Chart 2 (REBUILT): current assets / total assets / working capital ──
  const wcAssetsTrendOption = useMemo(() => ({
    grid: makeGrid({ top: 46 }),
    tooltip: makeTooltip((v) => faNum(v, 1)),
    legend: makeLegend(['دارایی‌های جاری', 'مجموع دارایی‌ها', 'سرمایه در گردش']),
    xAxis: categoryAxis(TREND_YEARS),
    yAxis: valueAxis(),
    series: [
      lineSeries({
        name: 'دارایی‌های جاری',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalCurrentAssets ?? null),
        color: PALETTE.teal,
        area: true,
      }),
      lineSeries({
        name: 'مجموع دارایی‌ها',
        data: TREND_YEARS.map((y) => allBalances[y]?.totalAssets ?? null),
        color: PALETTE.slate,
        area: true,
        symbol: 'rect',
        symbolSize: 8,
      }),
      lineSeries({
        name: 'سرمایه در گردش',
        data: TREND_YEARS.map((y) => {
          const ca = allBalances[y]?.totalCurrentAssets;
          const cl = allBalances[y]?.totalCurrentLiabilities;
          if (ca === null || ca === undefined || cl === null || cl === undefined) return null;
          return ca - cl;
        }),
        color: PALETTE.gold,
        dashed: true,
        symbol: 'diamond',
      }),
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
          <EChart option={payRecvTrendOption} style={{ height: 240 }} />
        </div>
        <div className="chart-card compact">
          <div className="chart-title compact">روند تغییرات سرمایه در گردش به ترند دارایی‌ها</div>
          <EChart option={wcAssetsTrendOption} style={{ height: 240 }} />
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
