import PageMetaData from '@/components/PageMetaData';
import ChangePasswordSetting from './components/ChangePasswordSetting';

const AccountSettingsPage = () => {
  return (
    <>
      <PageMetaData title="Account Settings" />
      <ChangePasswordSetting />
    </>
  );
};

export default AccountSettingsPage;