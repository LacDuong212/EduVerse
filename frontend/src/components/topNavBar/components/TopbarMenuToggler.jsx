import { useLayoutContext } from '@/context/useLayoutContext';

const TopbarMenuToggler = () => {
  const { appMenuControl } = useLayoutContext();

  return (
    <button onClick={appMenuControl.toggle} className="navbar-toggler ms-auto" aria-expanded={appMenuControl.open} data-bs-toggle="collapse">
      <span className="navbar-toggler-animation">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
};

export default TopbarMenuToggler;
