import PageMetaData from '@/components/PageMetaData';
import Banner from './components/Banner';
import WishlistCard from './components/WishlistCard';
const WishlistPage = () => {
  return <>
      <PageMetaData title="Wishlist" />
      <main>
        <Banner />
        <WishlistCard />
      </main>
    </>;
};
export default WishlistPage;
