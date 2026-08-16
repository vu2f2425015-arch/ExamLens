import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
