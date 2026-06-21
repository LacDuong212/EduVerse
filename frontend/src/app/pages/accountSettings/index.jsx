import { useSelector } from "react-redux";
import PageMetaData from '@/components/PageMetaData';
import ChangePasswordSetting from './components/ChangePasswordSetting';
import BankAccountSetting from './components/BankAccountSetting';

const AccountSettingsPage = () => {
  const { userData } = useSelector((state) => state.auth);
  const isInstructor = userData?.role === "instructor";

  return (
    <>
      <PageMetaData title="Settings" />
      <ChangePasswordSetting />
      {isInstructor && <BankAccountSetting />}
    </>
  );
};

export default AccountSettingsPage;
