import {useEffect, useState} from "react";
import type {TransactionResponseDto, TransactionsPageResponse} from "../types.ts";

const API_URL = 'http://localhost:3000/api/transactions';

const LIMIT_OPTIONS = [5, 10, 20, 50];

export const TransactionsHistory: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [data, setData] = useState<TransactionsPageResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // на будущее: сюда же можно подвесить модальное окно
    const [selected, setSelected] = useState<TransactionResponseDto | null>(null);

    const fetchPage = async (pageToLoad: number, limitToUse: number) => {
        setLoading(true);
        setError(null);

        try {
            const url = new URL(API_URL);
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

    // первая загрузка + обновление при изменении page/limit
    useEffect(() => {
        fetchPage(page, limit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit]);

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
        setPage(1); // сбрасываем на первую страницу
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString();
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
                                onClick={() => setSelected(t)}
                                title="Click to see details later"
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

            {/* Заглушка под будущий модал */}
            {selected && (
                <div className="history-selected-hint">
                    Selected transaction: <code>{selected.id}</code> (подробности покажем в модалке позже)
                </div>
            )}
        </div>
    );
};
