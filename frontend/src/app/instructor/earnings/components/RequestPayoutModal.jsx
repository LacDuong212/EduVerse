import { useCallback, useEffect, useState } from "react";
import { Form, Modal, Spinner } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";
import { formatCurrency } from "@/utils/currency";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

const currentPeriod = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

export default function RequestPayoutModal({ show, onHide, toBePaid, onSubmit, submitting }) {
  const [selectedBank,  setSelectedBank]  = useState("");
  const [bankAccounts,  setBankAccounts]  = useState([]);
  const [loadingBanks,  setLoadingBanks]  = useState(false);
  const [showManual,    setShowManual]    = useState(false);
  const [bankName,      setBankName]      = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName,   setAccountName]   = useState("");
  const [error,         setError]         = useState("");

  const fetchBankAccounts = useCallback(async () => {
    setLoadingBanks(true);
    const res = await handleRequest(authApi.get("/instructor/bank-accounts"));
    if (res.success) {
      const list = res.result || [];
      setBankAccounts(list);
      if (list.length > 0) {
        setSelectedBank(list[0]._id);
        setShowManual(false);
      } else {
        setShowManual(true);
      }
    }
    setLoadingBanks(false);
  }, []);

  useEffect(() => {
    if (show) fetchBankAccounts();
  }, [show, fetchBankAccounts]);

  const reset = () => {
    setSelectedBank("");
    setBankAccounts([]);
    setShowManual(false);
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setError("");
  };

  const handleHide = () => {
    reset();
    onHide();
  };

  const handleBankChange = (e) => {
    const val = e.target.value;
    if (val === "__manual__") {
      setShowManual(true);
      setSelectedBank("__manual__");
    } else {
      setShowManual(false);
      setSelectedBank(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!toBePaid || toBePaid <= 0) { setError("No available balance to withdraw."); return; }

    let bankInfo;
    if (showManual) {
      if (!bankName.trim())      { setError("Bank name is required.");       return; }
      if (!accountNumber.trim()) { setError("Account number is required.");  return; }
      if (!accountName.trim())   { setError("Account name is required.");    return; }
      bankInfo = { bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() };
    } else {
      const acc = bankAccounts.find((a) => a._id === selectedBank);
      if (!acc) { setError("Please select a bank account."); return; }
      bankInfo = { bankName: acc.bankName, accountNumber: acc.accountNumber, accountName: acc.accountName };
    }

    const ok = await onSubmit({ ...bankInfo, periodLabel: currentPeriod() });
    if (ok) handleHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.05rem" }}>Request Payout</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="vstack gap-3 p-4">
          <div
            className="rounded-3 p-3 text-center"
            style={{ background: "rgba(var(--bs-warning-rgb), 0.08)", border: "1px solid rgba(var(--bs-warning-rgb), 0.3)" }}
          >
            <div className="text-body small mb-1" style={{ opacity: 0.6 }}>Payout amount (full balance)</div>
            <div className="fw-bold text-warning" style={{ fontSize: "1.6rem" }}>
              {toBePaid != null ? formatCurrency(toBePaid) : "—"}
            </div>
          </div>

          <div className="border-top pt-3">
            <div className="small fw-semibold text-body mb-2" style={{ opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Bank Account
            </div>

            {loadingBanks ? (
              <div className="py-2 d-flex align-items-center gap-2 text-body small" style={{ opacity: 0.5 }}>
                <Spinner animation="border" size="sm" /> Loading accounts…
              </div>
            ) : (
              <>
                {bankAccounts.length > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Select size="sm" value={selectedBank} onChange={handleBankChange}>
                      {bankAccounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.bankName} — {acc.accountNumber} ({acc.accountName})
                        </option>
                      ))}
                      <option value="__manual__">+ Enter bank info manually</option>
                    </Form.Select>
                  </Form.Group>
                )}

                {showManual && (
                  <div className="vstack gap-3">
                    {bankAccounts.length === 0 && (
                      <div className="small text-body" style={{ opacity: 0.5 }}>
                        No saved accounts. Enter bank info below, or add accounts in{" "}
                        <a href="/instructor/settings" className="text-primary" target="_blank" rel="noreferrer">
                          Settings
                        </a>
                        .
                      </div>
                    )}
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-body">Bank Name</Form.Label>
                      <Form.Control
                        size="sm"
                        placeholder="e.g. Vietcombank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-body">Account Number</Form.Label>
                      <Form.Control
                        size="sm"
                        placeholder="e.g. 1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-body">Account Holder Name</Form.Label>
                      <Form.Control
                        size="sm"
                        placeholder="Full name as on bank account"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                    </Form.Group>
                  </div>
                )}

                {!showManual && selectedBank && selectedBank !== "__manual__" && (() => {
                  const acc = bankAccounts.find((a) => a._id === selectedBank);
                  return acc ? (
                    <div className="rounded-2 p-2 small text-body" style={{ background: "var(--bs-tertiary-bg, rgba(0,0,0,0.04))", opacity: 0.75 }}>
                      <div>{acc.bankName}</div>
                      <div>{acc.accountNumber} · {acc.accountName}</div>
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>

          {error && <div className="small text-danger">{error}</div>}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleHide}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            disabled={submitting || loadingBanks}
          >
            {submitting && <Spinner animation="border" size="sm" />}
            Submit Request
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
