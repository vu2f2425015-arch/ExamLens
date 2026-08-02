import Sidebar from '../../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

export default function StudentLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
