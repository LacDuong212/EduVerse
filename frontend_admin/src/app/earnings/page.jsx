import { useState, useEffect, useRef, memo } from 'react';
import PageMetaData from '@/components/PageMetaData';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'react-bootstrap';
import { BsInfoCircleFill } from 'react-icons/bs';
import { FaMoneyBillWave, FaSearch, FaTimes, FaFileExcel } from 'react-icons/fa';
import CountUp from 'react-countup';
import axios from 'axios';
import * as ExcelJS from 'exceljs';
import { formatCurrency } from '@/utils/currency';
import useSortableData from '@/hooks/useSortableData';
import SortableTh from '@/components/SortableTh';
import PaginationBar from '@/components/PaginationBar';


const CURRENCY_TITLES = ['total sales', 'pending revenue'];

const EarningsFastCard = memo(({
  amount,
  title,
  variant,
  isInfo
}) => {
  const isCurrency = CURRENCY_TITLES.includes(title?.toLowerCase());
  return <Col xs={12} sm={6}>
    <div className={`p-4 bg-${variant} bg-opacity-10 rounded-3 border border-${variant} border-opacity-25 shadow-sm stat-card-hover`}>
      <h6 className="small fw-semibold text-uppercase mb-2">
        {title}
        {isInfo && <a tabIndex={0} className="h6 mb-0 ms-1" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="top" data-bs-content="After US royalty withholding tax" data-bs-original-title>
          <BsInfoCircleFill className="small" />
        </a>}
      </h6>
      <h2 className={`mb-0 fs-2 fw-bold text-${variant}`}>
        <CountUp
          end={amount}
          duration={1.5}
          formattingFn={isCurrency ? (val) => formatCurrency(val) : undefined}
        />
      </h2>
    </div>
  </Col>;
});
const InvoiceHistoryCard = ({
  name,
  paymentMethod,
  date,
  amount,
  status,
  _id
}) => {
  return <tr>
    <td>
      <span className="badge bg-primary bg-opacity-10 text-primary font-monospace fw-bold border border-primary border-opacity-25" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
        #{String(_id).slice(-8).toUpperCase()}
      </span>
    </td>
    <td>
      <h6 className="table-responsive-title mb-0">
        <span>{name}</span>
      </h6>
      <small className="text-body font-monospace" style={{ fontSize: '0.7rem' }}>{_id}</small>
    </td>
    <td>{new Date(date).toLocaleString('en-GB', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })}</td>
    <td>
      <img
        src={paymentMethod.image}
        className="d-inline-block"
        style={{
          height: paymentMethod.type === 'vnpay'
            ? '30px'
            : paymentMethod.type === 'momo'
              ? '50px'
              : '35px',
          width: 'auto'
        }}
        alt="paymentMethodImg"
      />
    </td>
    <td className="text-end">
      {formatCurrency(amount)}
    </td>
    <td className="text-center text-uppercase">
      <div className={`badge bg-${status === 'completed' ? 'success' : status === 'pending' ? 'orange' : 'danger'} bg-opacity-10 text-${status === 'completed' ? 'success' : status === 'pending' ? 'orange' : 'danger'}`}>
        {status}
      </div>
    </td>
  </tr>;
};

const EarningsTable = ({ invoiceHistory }) => {
  const { sortedData, sortKey, sortDir, requestSort } = useSortableData(invoiceHistory, 'date', 'desc');
  return (
    <Table className="table-dark-gray align-middle p-4 mb-0 table-hover">
      <thead>
        <tr>
          <SortableTh label="Invoice ID" sortKey="_id" currentSortKey={sortKey} currentDir={sortDir} onSort={requestSort} className="border-0 text-center" />
          <SortableTh label="Course Name" sortKey="name" currentSortKey={sortKey} currentDir={sortDir} onSort={requestSort} className="border-0 text-center" />
          <SortableTh label="Date" sortKey="date" currentSortKey={sortKey} currentDir={sortDir} onSort={requestSort} className="border-0 text-center" />
          <th scope="col" className="border-0 text-center">Payment Method</th>
          <SortableTh label="Amount" sortKey="amount" currentSortKey={sortKey} currentDir={sortDir} onSort={requestSort} className="border-0 text-center" />
          <SortableTh label="Status" sortKey="status" currentSortKey={sortKey} currentDir={sortDir} onSort={requestSort} className="border-0 text-center" />
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <InvoiceHistoryCard key={`${item._id}-${index}`} {...item} />
        ))}
      </tbody>
    </Table>
  );
};

const EarningsPage = () => {
  const [earningsCards, setEarningsCards] = useState([]);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState('');
  const [appliedOrderId, setAppliedOrderId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const buildQueryParams = (orderId, dFrom, dTo, st) => {
    const params = new URLSearchParams();
    if (orderId) params.set('orderId', orderId);
    if (dFrom) params.set('dateFrom', dFrom);
    if (dTo) params.set('dateTo', dTo);
    if (st) params.set('status', st);
    return params.toString() ? `&${params.toString()}` : '';
  };

  const fetchStats = async () => {
    try {
      const statsRes = await axios.get(
        `${backendUrl}/api/earnings/stats`,
        { withCredentials: true }
      );
      if (statsRes.data.success) {
        setEarningsCards(statsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch earnings stats:", error);
    }
  };

  const fetchHistory = async (page = 1, orderId = '', dFrom = '', dTo = '', st = '') => {
    try {
      const extra = buildQueryParams(orderId, dFrom, dTo, st);
      const historyRes = await axios.get(
        `${backendUrl}/api/earnings/history?page=${page}&limit=${pageSize}${extra}`,
        { withCredentials: true }
      );
      if (historyRes.data.success) {
        setInvoiceHistory(historyRes.data.data);
        setPagination(historyRes.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch earnings history:", error);
    }
  };

  // Stats only once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // History re-fetches on filter/page/pageSize change
  useEffect(() => {
    fetchHistory(currentPage, appliedOrderId, appliedDateFrom, appliedDateTo, appliedStatus);
  }, [currentPage, pageSize, appliedOrderId, appliedDateFrom, appliedDateTo, appliedStatus]);

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedOrderId(searchInput.trim());
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedStatus(statusFilter);
  };

  const handleClear = () => {
    setSearchInput('');
    setAppliedOrderId('');
    setDateFrom('');
    setDateTo('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setStatusFilter('');
    setAppliedStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilter = appliedOrderId || appliedDateFrom || appliedDateTo || appliedStatus;

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const extra = buildQueryParams(appliedOrderId, appliedDateFrom, appliedDateTo, appliedStatus);
      const res = await axios.get(
        `${backendUrl}/api/earnings/history?page=1&limit=10000${extra}`,
        { withCredentials: true }
      );
      if (!res.data.success) return;

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Invoice History');

      ws.columns = [
        { header: 'Invoice ID', key: 'invoiceId', width: 14 },
        { header: 'Full Order ID', key: 'fullId', width: 28 },
        { header: 'Course Name', key: 'name', width: 42 },
        { header: 'Date', key: 'date', width: 18 },
        { header: 'Payment Method', key: 'payment', width: 18 },
        { header: 'Amount (VND)', key: 'amount', width: 16 },
        { header: 'Status', key: 'status', width: 14 },
      ];

      // Bold header row
      ws.getRow(1).font = { bold: true };

      res.data.data.forEach((item) => {
        ws.addRow({
          invoiceId: `#${String(item._id).slice(-8).toUpperCase()}`,
          fullId: String(item._id),
          name: item.name,
          date: new Date(item.date).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          payment: item.paymentMethod?.type ?? '',
          amount: item.amount,
          status: item.status,
        });
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-history${appliedOrderId ? `-${appliedOrderId}` : ''}${appliedDateFrom ? `-from-${appliedDateFrom}` : ''}${appliedDateTo ? `-to-${appliedDateTo}` : ''}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return <>
    <PageMetaData title="Earning" />
    <div className="page-title-box d-sm-flex align-items-start justify-content-between">
      <div>
        <h1 className="h3 mb-1 d-flex align-items-center gap-2">
          <FaMoneyBillWave className="text-success" size={22} /> Earnings
        </h1>
        <p className="page-subtitle mb-0">Revenue overview &amp; payment history</p>
      </div>
    </div>
    <Row className="g-4 mb-4">
      {earningsCards.map((item, idx) => <EarningsFastCard key={idx} {...item} />)}
    </Row>
    <Card className="bg-transparent border">
      <CardHeader className="bg-light border-bottom">
        {/* Row 1: title + export */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0 fw-semibold">Invoice History</h5>
          <button
            className="btn btn-sm btn-success d-flex align-items-center gap-2 mb-0"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <FaFileExcel />
            {isExporting ? 'Exporting…' : 'Export Excel'}
          </button>
        </div>
        {/* Row 2: all filters */}
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold mb-1">Invoice ID</label>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="Search by Invoice ID…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button type="button" className="btn btn-outline-secondary mb-0" onClick={handleClear} aria-label="Clear search">
                    <FaTimes />
                  </button>
                )}
                <button type="submit" className="btn btn-outline-secondary mb-0">
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">From</label>
            <input
              type="date"
              className="form-control form-control-sm bg-body"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">To</label>
            <input
              type="date"
              className="form-control form-control-sm bg-body"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">Status</label>
            <select
              className="form-select form-select-sm bg-body"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="col-6 col-md-2 d-flex gap-2">
            <button className="btn btn-sm btn-primary flex-fill mb-0" onClick={handleSearch}>
              Apply
            </button>
            {hasActiveFilter && (
              <button className="btn btn-sm btn-outline-secondary" onClick={handleClear} title="Clear all filters">
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pb-0">
        <div className="table-responsive border-0">
          <EarningsTable invoiceHistory={invoiceHistory} />
        </div>
      </CardBody>
      <CardHeader className="bg-transparent">
        <PaginationBar
          page={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </CardHeader>
    </Card>
  </>;
};
export default EarningsPage;
