import PageMetaData from '@/components/PageMetaData';
// import Banner from './components/Banner';
import EmptyCart from './components/EmptyCart';
const EmptyCartPage = () => {
  return <>
      <PageMetaData title="Empty Cart" />
      <main>
        {/* <Banner /> */}
        <EmptyCart />
      </main>
    </>;
};
export default EmptyCartPage;
