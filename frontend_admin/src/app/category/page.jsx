import PageMetaData from '@/components/PageMetaData';
import { FaLayerGroup } from 'react-icons/fa';
import AllCategories from './components/AllCategories';

const CategoryPage = () => {
  return (
    <>
      <PageMetaData title="Category Management" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaLayerGroup className="text-info" size={20} /> Categories
          </h1>
          <p className="page-subtitle mb-0">Manage course categories &amp; tags</p>
        </div>
      </div>
      <AllCategories />
    </>
  );
};

export default CategoryPage;