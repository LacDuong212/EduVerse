import PageMetaData from '@/components/PageMetaData';
import { FaCog } from 'react-icons/fa';
import AccountSetting from './components/AccountSetting';
const AdminSettingsPage = () => {
  return <>
      <PageMetaData title="Admin Setting" />
      <div className="page-title-box">
        <h1 className="h3 mb-1 d-flex align-items-center gap-2">
          <FaCog className="text-secondary" size={20} /> Admin Settings
        </h1>
        <p className="page-subtitle mb-0">Manage your account preferences</p>
      </div>
      <AccountSetting />
    </>;
};
export default AdminSettingsPage;
