import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "react-bootstrap";
import { BsPencil, BsPlus, BsTrash, BsXLg } from "react-icons/bs";
import { FaUniversity } from "react-icons/fa";
import { toast } from "react-toastify";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

const EMPTY_FORM = { bankName: "", accountNumber: "", accountName: "" };

function BankAccountForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bankName.trim())      { setError("Bank name is required.");       return; }
    if (!form.accountNumber.trim()) { setError("Account number is required.");  return; }
    if (!form.accountName.trim())   { setError("Account name is required.");    return; }
    setError("");
    onSave({ bankName: form.bankName.trim(), accountNumber: form.accountNumber.trim(), accountName: form.accountName.trim() });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="vstack gap-3">
        <Form.Group>
          <Form.Label className="small fw-semibold text-body">Bank Name</Form.Label>
          <Form.Control size="sm" placeholder="e.g. Vietcombank" value={form.bankName} onChange={set("bankName")} />
        </Form.Group>
        <Form.Group>
          <Form.Label className="small fw-semibold text-body">Account Number</Form.Label>
          <Form.Control size="sm" placeholder="e.g. 1234567890" value={form.accountNumber} onChange={set("accountNumber")} />
        </Form.Group>
        <Form.Group>
          <Form.Label className="small fw-semibold text-body">Account Holder Name</Form.Label>
          <Form.Control size="sm" placeholder="Full name as on bank account" value={form.accountName} onChange={set("accountName")} />
        </Form.Group>
        {error && <div className="small text-danger">{error}</div>}
        <div className="d-flex gap-2 justify-content-end pt-1">
          <Button variant="outline-secondary" size="sm" type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={saving} className="d-flex align-items-center gap-2">
            {saving && <Spinner animation="border" size="sm" />}
            Save
          </Button>
        </div>
      </div>
    </Form>
  );
}

export default function BankAccountSetting() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [error,    setError]    = useState("");

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const res = await handleRequest(authApi.get("/instructor/bank-accounts"));
    if (res.success) setAccounts(res.result || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) fetchAccounts();
  }, [isOpen, fetchAccounts]);

  const handleAdd = async (data) => {
    setSaving(true);
    const res = await handleRequest(authApi.post("/instructor/bank-accounts", data));
    if (res.success) {
      toast.success("Bank account added.");
      setShowAdd(false);
      fetchAccounts();
    } else {
      setError(res.message || "Failed to add account.");
    }
    setSaving(false);
  };

  const handleUpdate = async (bankId, data) => {
    setSaving(true);
    const res = await handleRequest(authApi.patch(`/instructor/bank-accounts/${bankId}`, data));
    if (res.success) {
      toast.success("Bank account updated.");
      setEditId(null);
      fetchAccounts();
    } else {
      setError(res.message || "Failed to update account.");
    }
    setSaving(false);
  };

  const handleDelete = async (bankId) => {
    if (!window.confirm("Delete this bank account?")) return;
    setSaving(true);
    const res = await handleRequest(authApi.delete(`/instructor/bank-accounts/${bankId}`));
    if (res.success) {
      toast.success("Bank account deleted.");
      fetchAccounts();
    } else {
      setError(res.message || "Failed to delete account.");
    }
    setSaving(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditId(null);
    setShowAdd(false);
    setError("");
  };

  return (
    <>
      <div className="bg-light rounded-3 p-4 mb-3">
        <div className="d-md-flex justify-content-between align-items-center">
          <div>
            <h6 className="h5">Banking Accounts</h6>
            <p className="mb-1 mb-md-0">Manage your saved bank accounts for payout requests.</p>
          </div>
          <div>
            <Button variant="primary" className="mb-1" onClick={() => setIsOpen(true)}>
              Manage Accounts
            </Button>
          </div>
        </div>
      </div>

      <Modal show={isOpen} onHide={handleClose} centered size="md">
        <ModalHeader className="modal-header bg-dark">
          <h5 className="modal-title text-white d-flex align-items-center gap-2">
            <FaUniversity size={16} /> Banking Accounts
          </h5>
          <button onClick={handleClose} type="button" className="btn btn-sm btn-light mb-0 ms-auto">
            <BsXLg />
          </button>
        </ModalHeader>

        <ModalBody className="p-4">
          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" className="text-body opacity-50" />
            </div>
          ) : (
            <div className="vstack gap-3">
              {accounts.length === 0 && !showAdd && (
                <div className="text-center py-3 text-body" style={{ opacity: 0.45 }}>
                  <FaUniversity size={28} className="mb-2 d-block mx-auto" />
                  <div className="small">No bank accounts saved yet.</div>
                </div>
              )}

              {accounts.map((acc) => (
                <div key={acc._id}>
                  {editId === acc._id ? (
                    <div className="border rounded-3 p-3">
                      <BankAccountForm
                        initial={{ bankName: acc.bankName, accountNumber: acc.accountNumber, accountName: acc.accountName }}
                        onSave={(data) => handleUpdate(acc._id, data)}
                        onCancel={() => setEditId(null)}
                        saving={saving}
                      />
                    </div>
                  ) : (
                    <div
                      className="d-flex align-items-center gap-3 border rounded-3 p-3"
                      style={{ background: "var(--bs-tertiary-bg, rgba(0,0,0,0.02))" }}
                    >
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold text-body" style={{ fontSize: "0.9rem" }}>
                          {acc.bankName}
                        </div>
                        <div className="text-body small" style={{ opacity: 0.55 }}>
                          {acc.accountNumber} · {acc.accountName}
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-shrink-0">
                        <button
                          className="btn btn-link btn-sm p-1 text-body text-decoration-none"
                          style={{ opacity: 0.5 }}
                          onClick={() => { setEditId(acc._id); setShowAdd(false); }}
                          title="Edit"
                        >
                          <BsPencil size={14} />
                        </button>
                        <button
                          className="btn btn-link btn-sm p-1 text-danger text-decoration-none"
                          style={{ opacity: 0.5 }}
                          onClick={() => handleDelete(acc._id)}
                          disabled={saving}
                          title="Delete"
                        >
                          <BsTrash size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {showAdd && (
                <div className="border rounded-3 p-3 border-primary border-opacity-50">
                  <div className="small fw-semibold text-body mb-3 d-flex align-items-center gap-2">
                    <BsPlus size={16} /> New Bank Account
                  </div>
                  <BankAccountForm
                    onSave={handleAdd}
                    onCancel={() => setShowAdd(false)}
                    saving={saving}
                  />
                </div>
              )}

              {!showAdd && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-2 align-self-start"
                  onClick={() => { setShowAdd(true); setEditId(null); }}
                >
                  <BsPlus size={16} /> Add Account
                </Button>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-danger-soft my-0" onClick={handleClose}>
            Close
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
