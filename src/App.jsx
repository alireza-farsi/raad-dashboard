import { useMemo, useRef, useState } from 'react';
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
import { exportAllPagesToPdf } from './utils/exportUtils';

const PAGES = [
  { key: 'about', label: 'درباره شرکت' },
  { key: 'summary', label: 'خلاصه گزارش' },
  { key: 'pl', label: 'صورت سود و زیان' },
  { key: 'balance', label: 'ترازنامه' },
  { key: 'credit', label: 'اعتباری' },
  { key: 'comparative1', label: 'ارقام مقایسه‌ای (ترازنامه و سود و زیان)' },
  { key: 'comparative2', label: 'ارقام مقایسه‌ای (ترازنامه و اعتبارات)' },
  { key: 'analysis', label: 'عارضه‌یابی اطلاعات مالی' },
];

export default function App() {
  const [activePage, setActivePage] = useState('about');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
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

  const setActivePageRef = useRef(setActivePage);
  setActivePageRef.current = setActivePage;

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      // Set the active page in sequence, then capture and add to PDF.
      const setActiveAndWait = async (key) => {
        setActivePageRef.current(key);
        await new Promise((r) => setTimeout(r, 400));
      };
      // We pass a custom setter that also updates progress.
      await exportAllPagesToPdf(
        PAGES,
        async (key) => {
          await setActiveAndWait(key);
          setExportProgress((p) => p + 1);
        },
        `raad-report-${selectedYear}.pdf`,
        'export-root'
      );
    } finally {
      // Restore the original page after export.
      setActivePage(activePage);
      setIsExporting(false);
    }
  };

  const currentPage = PAGES.find((p) => p.key === activePage);

  return (
    <div className="dashboard-shell">
      <Sidebar active={activePage} onChange={setActivePage} companyName={raadData.companyInfo.name} />

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">{currentPage?.label}</div>
          <div className="topbar-actions">
            <YearFilter years={years} selected={selectedYear} onChange={setSelectedYear} />
            <div className="export-actions">
              <button
                className="export-btn pdf-btn"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting
                  ? `در حال تولید PDF... (${exportProgress}/${PAGES.length})`
                  : 'خروجی PDF (تمام صفحات)'}
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
