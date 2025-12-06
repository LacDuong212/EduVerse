import logo from '@/assets/images/logo/logo.svg';
import logoLight from '@/assets/images/logo/logo_light.svg';

const LogoBox = ({ height, width, isDarkMode = false }) => {
  if (isDarkMode) return (
    <>
      <img height={height} width={width} className="light-mode-item" src={logoLight} alt="logo" />
      <img height={height} width={width} className="dark-mode-item" src={logoLight} alt="logo" />
    </>
  );

  return (
    <>
      <img height={height} width={width} className="light-mode-item" src={logo} alt="logo" />
      <img height={height} width={width} className="dark-mode-item" src={logoLight} alt="logo" />
    </>
  );
};

export default LogoBox;
