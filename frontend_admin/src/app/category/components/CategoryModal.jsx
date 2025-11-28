import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CategoryModal = ({ show, onHide, onSubmit, editingCategory }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory, show]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name });
    setName("");
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingCategory ? "Edit Category" : "Add New Category"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter category name (e.g. Web Development)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editingCategory ? "Update" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CategoryModal;