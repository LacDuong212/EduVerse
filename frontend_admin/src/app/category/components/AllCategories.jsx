import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardFooter, CardHeader, Col, Row, TabContainer, Button } from 'react-bootstrap';
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationBar from '@/components/PaginationBar';

import CategoryList from './CategoryList';
import CategoryModal from './CategoryModal';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/helpers/data';

const AllCategories = () => {
  const [allData, setAllData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fuseOptions = {
    keys: ['name', 'slug'],
    threshold: 0.3,
    includeScore: true
  };
  
  // Fetch Data
  const fetchCategories = async () => {
    setIsLoading(true);
    const response = await getAllCategories();
    if (response && response.success) {
      setAllData(response.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    
    const response = await deleteCategory(id);
    if (response.success) {
      fetchCategories(); // Reload data
    } else {
      toast.error(response.message);
    }
  };

  // Handle Modal Open
  const handleShowAdd = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleShowEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (formData) => {
    let response;
    if (editingCategory) {
      // Update
      response = await updateCategory(editingCategory._id, formData);
    } else {
      // Create
      response = await createCategory(formData);
    }

    if (response.success) {
      setShowModal(false);
      fetchCategories();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <>
      <Card>
        <TabContainer defaultActiveKey={1}>
          <CardHeader className="border-bottom">
            <Row className="g-3 align-items-center justify-content-between">
              {/* Search Bar */}
              <Col md={6}>
                <div className="input-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Search Categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type="button" className="btn btn-outline-secondary border-0" onClick={() => setSearch('')} aria-label="Clear search">
                      <FaTimes className="small" />
                    </button>
                  )}
                  <button type="button" className="btn btn-outline-secondary border-0">
                    <FaSearch className="fs-6" />
                  </button>
                </div>
              </Col>
              
              {/* Add Button */}
              <Col md={4} className="text-md-end">
                <Button variant="primary" onClick={handleShowAdd}>
                  <FaPlus className="me-2" /> Add Category
                </Button>
              </Col>
            </Row>
          </CardHeader>

          <CardBody>
            <CategoryList 
              categoriesData={paginatedData}
              isLoading={isLoading}
              onEdit={handleShowEdit}
              onDelete={handleDelete}
            />
          </CardBody>
        </TabContainer>
        
        <CardFooter>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </CardFooter>
      </Card>

      {/* Modal Form */}
      <CategoryModal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        editingCategory={editingCategory}
      />
    </>
  );
};

export default AllCategories;