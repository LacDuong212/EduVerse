import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ITEMS_PER_PAGE = 12;

const useWishlist = () => {
  const { items, status } = useSelector((state) => state.wishlist);

  const [currentPage, setCurrentPage] = useState(1);

  const validItems = Array.isArray(items)
    ? items.filter(item => item.courseId)
    : [];

  const totalItems = validItems?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, totalPages, currentPage]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = validItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    currentItems,
    currentPage,
    totalItems,
    totalPages,
    status,
    handlePageChange,
  };
};

export default useWishlist;
