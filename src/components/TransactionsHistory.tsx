import React, { useEffect, useState } from 'react';
import type {
    Transaction,
    TransactionsPageResponse,
    GetTransactionResponseDto,
} from '../types';
import { ChangesTable } from './ChangesTable';

const LIST_API_URL = 'http://localhost:3000/api/transactions';
const DETAIL_API_URL = 'http://localhost:3000/api/transactions';

const LIMIT_OPTIONS = [5, 10, 20, 50];

export const TransactionsHistory: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [data, setData] = useState<TransactionsPageResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [detail, setDetail] = useState<GetTransactionResponseDto | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchPage = async (pageToLoad: number, limitToUse: number) => {
        setLoading(true);
        setError(null);

        try {
            const url = new URL(LIST_API_URL);
            url.searchParams.set('page', String(pageToLoad));
            url.searchParams.set('limit', String(limitToUse));

            const resp = await fetch(url.toString());
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status}: ${text}`);
            }

            const json: TransactionsPageResponse = await resp.json();
            setData(json);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage(page, limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

    const fetchDetail = async (id: string) => {
        setDetail(null);
        setDetailError(null);
        setDetailLoading(true);
        setIsDetailOpen(true);

        try {
            const resp = await fetch(`${DETAIL_API_URL}/${id}`);
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status}: ${text}`);
            }
            const json: GetTransactionResponseDto = await resp.json();
            setDetail(json);
        } catch (e: any) {
            setDetailError(e?.message ?? 'Failed to load transaction details');
        } finally {
            setDetailLoading(false);
        }
    };

    const total = data?.total ?? 0;
    const pages = data?.pages ?? 1;
    const transactions = data?.transactions ?? [];

    const handlePrev = () => {
        setPage((p) => Math.max(1, p - 1));
    };

    const handleNext = () => {
        setPage((p) => (data ? Math.min(data.pages, p + 1) : p + 1));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(e.target.value || 10);
        setLimit(newLimit);
        setPage(1);
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString();
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        setDetail(null);
        setDetailError(null);
    };

    return (
        <div className="history-root">
            <div className="history-header">
                <div>
                    <h2>Transactions history</h2>
                    <div className="history-meta">
                        <span>Total: {total}</span>
                        {data && (
                            <span>
                Page {data.page} / {data.pages}
              </span>
                        )}
                    </div>
                </div>

                <div className="history-controls">
                    <label>
                        Per page:{' '}
                        <select value={limit} onChange={handleLimitChange}>
                            {LIMIT_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button onClick={handlePrev} disabled={loading || page <= 1}>
                        ‹ Prev
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading || page >= pages}
                    >
                        Next ›
                    </button>
                </div>
            </div>

            {loading && <div className="placeholder">Loading…</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && transactions.length === 0 && (
                <div className="placeholder">No transactions yet</div>
            )}

            {!loading && !error && transactions.length > 0 && (
                <div className="table-wrapper">
                    <table className="changes-table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Created at</th>
                            <th>Status</th>
                            <th>Choices</th>
                            <th>Custom queries</th>
                            <th>Input snippet</th>
                            <th>Error</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((t, idx) => (
                            <tr
                                key={t.id}
                                className="clickable-row"
                                onClick={() => fetchDetail(t.id)}
                                title="Click to view details"
                            >
                                <td>{(page - 1) * limit + idx + 1}</td>
                                <td>{formatDate(t.createdAt)}</td>
                                <td>{t.status}</td>
                                <td>{t.choices.join(', ')}</td>
                                <td>{t.customQueries.join(', ')}</td>
                                <td>
                                    {t.inputText.length > 80
                                        ? t.inputText.slice(0, 77) + '…'
                                        : t.inputText}
                                </td>
                                <td>
                                    {t.errorMessage
                                        ? t.errorMessage.length > 40
                                            ? t.errorMessage.slice(0, 37) + '…'
                                            : t.errorMessage
                                        : ''}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модальное окно с деталями транзакции */}
            {isDetailOpen && (
                <div className="modal-backdrop" onClick={closeDetail}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Transaction details</h3>
                            <button className="modal-close" onClick={closeDetail}>
                                ×
                            </button>
                        </div>

                        {detailLoading && <div className="placeholder">Loading details…</div>}
                        {detailError && <div className="error">{detailError}</div>}

                        {detail && (
                            <div className="modal-body">
                                <section className="modal-section">
                                    <h4>Summary</h4>
                                    <div className="summary-grid">
                                        <div>
                                            <strong>ID:</strong> {detail.transaction.id}
                                        </div>
                                        <div>
                                            <strong>Status:</strong> {detail.transaction.status}
                                        </div>
                                        <div>
                                            <strong>Created:</strong>{' '}
                                            {formatDate(detail.transaction.createdAt)}
                                        </div>
                                        <div>
                                            <strong>Requested:</strong>{' '}
                                            {formatDate(detail.transaction.requestedAt)}
                                        </div>
                                        <div>
                                            <strong>Processed:</strong>{' '}
                                            {formatDate(detail.transaction.processedAt)}
                                        </div>
                                    </div>
                                    <div className="summary-grid">
                                        <div>
                                            <strong>Choices:</strong>{' '}
                                            {detail.transaction.choices.join(', ')}
                                        </div>
                                        <div>
                                            <strong>Custom queries:</strong>{' '}
                                            {detail.transaction.customQueries.join(', ')}
                                        </div>
                                    </div>
                                    {detail.transaction.errorMessage && (
                                        <div className="error">
                                            <strong>Error:</strong> {detail.transaction.errorMessage}
                                        </div>
                                    )}
                                </section>

                                <section className="modal-section">
                                    <h4>Stats</h4>
                                    <pre className="stats-block">
                    {JSON.stringify(detail.transaction.stats, null, 2)}
                  </pre>
                                </section>

                                <section className="modal-section">
                                    <h4>Input text</h4>
                                    <pre className="final-text">
                    {detail.transaction.inputText}
                  </pre>
                                </section>

                                <section className="modal-section">
                                    <h4>Final text</h4>
                                    <pre className="final-text">
                    {detail.transaction.finalText}
                  </pre>
                                </section>

                                <section className="modal-section">
                                    <h4>Changes</h4>
                                    {detail.changes.length === 0 ? (
                                        <div className="placeholder">No changes</div>
                                    ) : (
                                        <ChangesTable changes={detail.changes} />
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
