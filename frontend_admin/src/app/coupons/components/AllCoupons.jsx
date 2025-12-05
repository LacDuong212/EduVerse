import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardFooter, CardHeader, Col, Row, TabContainer, Button } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaSearch, FaPlus } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CouponList from './CouponList';
import CouponModal from './CouponModal';
import { getAllCoupons, createCoupon, updateCouponStatus, deleteCoupon } from '@/helpers/data';

const AllCoupons = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [showModal, setShowModal] = useState(false);

  // Fuse config: Tìm kiếm theo Code
  const fuseOptions = {
    keys: ['code'],
    threshold: 0.3,
    includeScore: true
  };
  
  // Fetch Data
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCoupons();
      if (response && response.success) {
        setAllData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Pagination & Search Logic
  const { paginatedData, totalPages, totalItems } = useMemo(() => {
    let processedData = allData;

    if (search.trim()) {
      const fuse = new Fuse(allData, fuseOptions);
      const results = fuse.search(search);
      processedData = results.map(result => result.item);
    }

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const validPage = page > totalPages ? 1 : page; 
    
    const startIndex = (validPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = processedData.slice(startIndex, endIndex);

    return { paginatedData, totalPages, totalItems };
  }, [allData, search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
        const response = await deleteCoupon(id);
        if (response.success) {
            toast.success("Coupon deleted");
            fetchCoupons();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting");
    }
  };

  // Handle Toggle Active Status
  const handleToggleStatus = async (coupon) => {
    try {
        const newStatus = !coupon.isActive;
        const response = await updateCouponStatus(coupon._id, newStatus);
        if (response.success) {
            toast.success(`Coupon is now ${newStatus ? 'Active' : 'Inactive'}`);
            fetchCoupons(); // Refresh list
        }
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  // Handle Create
  const handleFormSubmit = async (formData) => {
    try {
        const response = await createCoupon(formData);
        if (response.success) {
            toast.success(response.message);
            setShowModal(false);
            fetchCoupons();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Error creating coupon");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <Card className="bg-transparent">
        <TabContainer defaultActiveKey={1}>
          <CardHeader className="bg-transparent border-bottom px-0">
            <Row className="g-3 align-items-center justify-content-between">
              {/* Search Bar */}
              <Col md={6}>
                <form className="rounded position-relative" onSubmit={(e) => e.preventDefault()}>
                  <input
                    className="form-control bg-transparent"
                    type="text"
                    placeholder="Search Coupon Code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset">
                    <FaSearch className="fs-6 " />
                  </button>
                </form>
              </Col>
              
              {/* Add Button */}
              <Col md={4} className="text-md-end">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  <FaPlus className="me-2" /> Create Coupon
                </Button>
              </Col>
            </Row>
          </CardHeader>

          <CardBody className="px-0">
            <CouponList 
              couponsData={paginatedData}
              isLoading={isLoading}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          </CardBody>
        </TabContainer>
        
        {/* Pagination UI */}
        <CardFooter className="bg-transparent pt-0 px-0">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start">
              Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
            </p>
            <nav className="d-flex justify-content-center mb-0">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <FaAngleLeft />
                  </button>
                </li>
                {getPageNumbers().map(pageNum => (
                  <li key={pageNum} className={`page-item mb-0 ${pageNum === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
                  </li>
                ))}
                <li className={`page-item mb-0 ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CardFooter>
      </Card>

      {/* Modal Form */}
      <CouponModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
      />
      <ToastContainer />
    </>
  );
};

export default AllCoupons;