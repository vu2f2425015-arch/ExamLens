import Navbar from '../../components/Navbar/Navbar';
import FeaturedReportCharts from '../../components/FeaturedReportCharts/FeaturedReportCharts';
import { MdDownload, MdBarChart } from 'react-icons/md';
import DashboardCard from '../../components/DashboardCard/DashboardCard';

export default function Reports() {
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
          <DashboardCard title="Avg Score"        value="78%"  icon={MdBarChart} color="primary"   index={0} />
          <DashboardCard title="Pass Rate"        value="91%"  icon={MdBarChart} color="accent"    index={1} />
          <DashboardCard title="Total Violations" value="118" icon={MdBarChart} color="warning" index={2} />
          <DashboardCard title="Exams Done"       value="5"    icon={MdBarChart} color="secondary" index={3} />
        </div>

        {/* Interactive Hero + Thumbnails Featured Report Charts (matching Dashboard structure) */}
        <FeaturedReportCharts />
      </main>
    </>
  );
}

