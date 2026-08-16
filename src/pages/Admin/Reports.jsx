import Navbar from '../../components/Navbar/Navbar';
import FeaturedReportCharts from '../../components/FeaturedReportCharts/FeaturedReportCharts';
import { MdDownload, MdBarChart } from 'react-icons/md';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import { useState, useEffect } from 'react';
import { fetchReportsSummary } from '../../services/apiService';

export default function Reports() {
  const [report, setReport] = useState({
    avgScore: '78%',
    passRate: '91%',
    totalViolations: 118,
    examsDone: 5,
  });

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await fetchReportsSummary();
        if (data) {
          setReport((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        // use default state
      }
    }
    loadSummary();
  }, []);

  return (
    <>
      <Navbar title="Reports" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive examination data and AI analysis</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <MdDownload /> Export PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Avg Score"        value={report.avgScore}        icon={MdBarChart} color="primary"   index={0} />
          <DashboardCard title="Pass Rate"        value={report.passRate}        icon={MdBarChart} color="accent"    index={1} />
          <DashboardCard title="Total Violations" value={report.totalViolations} icon={MdBarChart} color="warning" index={2} />
          <DashboardCard title="Exams Done"       value={report.examsDone}       icon={MdBarChart} color="secondary" index={3} />
        </div>

        {/* Interactive Hero + Thumbnails Featured Report Charts (matching Dashboard structure) */}
        <FeaturedReportCharts />
      </main>
    </>
  );
}

