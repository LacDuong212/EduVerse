import PageMetaData from '@/components/PageMetaData';
import Banner from './components/Banner';
import CartDetails from './components/CartDetails';
const CartPage = () => {
  return <>
      <PageMetaData title="Shop Cart" />
      <main>
        <Banner />
        <CartDetails />
      </main>
    </>;
};

export default CartPage;