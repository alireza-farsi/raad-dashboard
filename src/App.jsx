import { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import YearFilter, { toFarsiDigits } from './components/YearFilter';
import PageAbout from './components/PageAbout';
import PageSummary from './components/PageSummary';
import PagePL from './components/PagePL';
import PageBalance from './components/PageBalance';
import PageCredit from './components/PageCredit';
import PageComparative1 from './components/PageComparative1';
import PageComparative2 from './components/PageComparative2';
import PageAnalysis from './components/PageAnalysis';
import raadData from './data/raadData.json';
import { exportToExcel, exportElementToPdf } from './utils/exportUtils';

const PAGE_TITLES = {
  about: 'درباره شرکت',
  summary: 'خلاصه گزارش',
  pl: 'صورت سود و زیان',
  balance: 'ترازنامه',
  credit: 'اعتباری',
  comparative1: 'ارقام مقایسه‌ای (ترازنامه و صورت سود و زیان)',
  comparative2: 'ارقام مقایسه‌ای (ترازنامه و اعتبارات)',
  analysis: 'عارضه‌یابی اطلاعات مالی',
};

export default function App() {
  const [activePage, setActivePage] = useState('about');
  const years = useMemo(
    () => Object.keys(raadData.financialsByYear).sort((a, b) => Number(b) - Number(a)),
    []
  );
  const [selectedYear, setSelectedYear] = useState('1403');

  const financials = raadData.financialsByYear[selectedYear];
  const income = raadData.incomeByYear[selectedYear];
  const balance = raadData.balanceByYear[selectedYear];
  const ratios = raadData.ratiosByYear[selectedYear];
  const credit = raadData.creditByYear[selectedYear];
  const creditReal = raadData.creditRealByYear[selectedYear];
  const diagnosis = raadData.diagnosisByYear[selectedYear];

  const handleExportExcel = () => {
    const rows = Object.entries(raadData.financialsByYear).map(([year, f]) => ({
      'سال مالی': year,
      'درآمد عملیاتی': f.revenue ?? '',
      'سود عملیاتی': f.ebit ?? '',
      'سود خالص': f.netProfit ?? '',
      'سود ناخالص': f.grossProfit ?? '',
      'بهای تمام‌شده': f.costOfRevenue ?? '',
      'مجموع دارایی‌ها': f.totalAssets ?? '',
      'دارایی جاری': f.totalCurrentAssets ?? '',
      'بدهی جاری': f.totalCurrentLiabilities ?? '',
      'مجموع بدهی‌ها': f.totalLiabilities ?? '',
      'حقوق صاحبان سهام': f.equities ?? '',
      'سرمایه ثبتی': f.stock ?? '',
      'تسهیلات فعال بانکی': f.activeBankFacility ?? '',
    }));
    exportToExcel(rows, 'گزارش مالی', `raad-financials-${selectedYear}.xlsx`);
  };

  const handleExportPdf = () => {
    exportElementToPdf('export-root', `raad-report-${activePage}-${selectedYear}.pdf`);
  };

  return (
    <div className="dashboard-shell">
      <Sidebar active={activePage} onChange={setActivePage} companyName={raadData.companyInfo.name} />

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{PAGE_TITLES[activePage]}</div>
          <div className="topbar-actions">
            <YearFilter years={years} selected={selectedYear} onChange={setSelectedYear} />
            <div className="export-actions">
              <button className="export-btn" onClick={handleExportExcel}>
                خروجی اکسل
              </button>
              <button className="export-btn" onClick={handleExportPdf}>
                خروجی PDF
              </button>
            </div>
          </div>
        </header>

        <main className="content-area" id="export-root">
          {activePage === 'about' && (
            <PageAbout
              companyInfo={raadData.companyInfo}
              knowledgeBase={raadData.knowledgeBase}
              boardOfDirectors={raadData.boardOfDirectors}
              shareholders={raadData.shareholders}
              products={raadData.products}
            />
          )}
          {activePage === 'summary' && (
            <PageSummary
              financials={financials}
              credit={credit}
              creditReal={creditReal}
              year={selectedYear}
            />
          )}
          {activePage === 'pl' && (
            <PagePL
              income={income}
              ratios={ratios}
              year={selectedYear}
              allIncomes={raadData.incomeByYear}
            />
          )}
          {activePage === 'balance' && (
            <PageBalance
              balance={balance}
              year={selectedYear}
              allBalances={raadData.balanceByYear}
            />
          )}
          {activePage === 'credit' && (
            <PageCredit
              banks={raadData.banks}
              facilitiesByYear={raadData.facilitiesByYear}
              incomeByYear={raadData.incomeByYear}
              creditRealByYear={raadData.creditRealByYear}
              diagnosisByYear={raadData.diagnosisByYear}
              year={selectedYear}
            />
          )}
          {activePage === 'comparative1' && (
            <PageComparative1
              incomeByYear={raadData.incomeByYear}
              balanceByYear={raadData.balanceByYear}
              ratiosByYear={raadData.ratiosByYear}
              financialsByYear={raadData.financialsByYear}
              year={selectedYear}
            />
          )}
          {activePage === 'comparative2' && (
            <PageComparative2
              balanceByYear={raadData.balanceByYear}
              ratiosByYear={raadData.ratiosByYear}
              creditRealByYear={raadData.creditRealByYear}
              creditByYear={raadData.creditByYear}
              year={selectedYear}
            />
          )}
          {activePage === 'analysis' && (
            <PageAnalysis
              diagnosis={diagnosis}
              year={selectedYear}
            />
          )}
        </main>
      </div>
    </div>
  );
}
