import { useState, useEffect, useMemo } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Modal, Row, TabContainer } from 'react-bootstrap';
import { FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CouponList from './CouponList';
import CouponModal from './CouponModal';
import PaginationBar from '@/components/PaginationBar';
import { getAllCoupons, createCoupon, updateCoupon, updateCouponStatus, deleteCoupon } from '@/helpers/data';

const PAGE_SIZE = 6;

const AllCoupons = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fuse config: search by code
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
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const validPage = page > totalPages ? 1 : page;

    const startIndex = (validPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedData = processedData.slice(startIndex, endIndex);

    return { paginatedData, totalPages, totalItems };
  }, [allData, search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Handle Delete
  const handleDeleteClick = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await deleteCoupon(deleteTarget);
      if (response.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting");
    }
    setDeleteTarget(null);
  };

  // Handle Toggle Active Status
  const handleToggleStatus = async (coupon) => {
    try {
      const newStatus = !coupon.isActive;
      const response = await updateCouponStatus(coupon._id, newStatus);
      if (response.success) {
        toast.success(`Coupon is now ${newStatus ? 'Active' : 'Inactive'}`);
        fetchCoupons();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle Create
  const handleCreateSubmit = async (formData) => {
    try {
      const response = await createCoupon(formData);
      if (response.success) {
        toast.success(response.message);
        setShowCreateModal(false);
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating coupon");
    }
  };

  // Handle Edit
  const handleEditClick = (coupon) => setEditTarget(coupon);

  const handleEditSubmit = async (formData) => {
    if (!editTarget) return;
    try {
      const response = await updateCoupon(editTarget._id, formData);
      if (response.success) {
        toast.success("Coupon updated successfully");
        setEditTarget(null);
        fetchCoupons();
      } else {
        toast.error(response.message || "Error updating coupon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating coupon");
    }
  };

  return (
    <>
      <Card className="bg-transparent">
        <TabContainer defaultActiveKey={1}>
          <CardHeader className="bg-transparent border-bottom px-0">
            <Row className="g-3 align-items-center justify-content-between">
              <Col md={6}>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search coupon code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button type="button" className="btn btn-outline-secondary border-0" onClick={() => setSearch('')} aria-label="Clear search">
                        <FaTimes className="small" />
                      </button>
                    )}
                    <button type="submit" className="btn btn-outline-secondary border-0">
                      <FaSearch />
                    </button>
                  </div>
                </form>
              </Col>

              <Col md={4} className="text-md-end">
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
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
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
            />
          </CardBody>
        </TabContainer>

        <CardFooter className="bg-transparent pt-0 px-0">
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </CardFooter>
      </Card>

      {/* Create Modal */}
      <CouponModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Modal */}
      <CouponModal
        show={!!editTarget}
        onHide={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        initialData={editTarget}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this coupon? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default AllCoupons;