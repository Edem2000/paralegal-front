import './App.css'
import React, { useState } from 'react';
import type { ApiResponse, Change, Kind } from './types';
import {ChangesTable} from "./components/ChangesTable.tsx";
import {TransactionsHistory} from "./components/TransactionsHistory.tsx";

const ALL_KINDS: { id: Kind; label: string }[] = [
    { id: 'phone',    label: 'Phone' },
    { id: 'email',    label: 'Email' },
    { id: 'card',     label: 'Card' },
    { id: 'passport', label: 'Passport' },
    { id: 'tin',      label: 'TIN' },
];

type MaskingMode = 'readable_full' | 'full' | 'keep_tail' | 'keep_head_tail';

const App: React.FC = () => {
    const [view, setView] = useState<'mask' | 'history'>('mask');

    const [choices, setChoices] = useState<Kind[]>([
        'phone',
        'email',
        'card',
        'passport',
        'tin',
    ]);

    const [customQueryInput, setCustomQueryInput] = useState('');
    const [customQueries, setCustomQueries] = useState<string[]>([]);

    const [inputText, setInputText] = useState('');

    const [maskingMode, setMaskingMode] = useState<MaskingMode>('readable_full');
    const [tailLength, setTailLength] = useState<number>(4);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ApiResponse | null>(null);

    const toggleChoice = (kind: Kind) => {
        setChoices((prev) =>
            prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind],
        );
    };

    const addCustomQuery = () => {
        const trimmed = customQueryInput.trim();
        if (!trimmed) return;
        setCustomQueries((prev) => [...prev, trimmed]);
        setCustomQueryInput('');
    };

    const removeCustomQuery = (index: number) => {
        setCustomQueries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setResult(null);

        try {
            const body = {
                inputText,
                choices,
                customQueries,
                maskingMode,
                tailLength:
                    maskingMode === 'keep_tail' || maskingMode === 'keep_head_tail'
                        ? tailLength
                        : undefined,
            };

            const resp = await fetch('http://localhost:3000/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status}: ${text}`);
            }

            const data: ApiResponse = await resp.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message ?? 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const changes: Change[] = result?.changes ?? [];

    return (
        <div className="app">
            {/* NAVBAR */}
            <header className="navbar">
                <div className="navbar-left">
                    <span className="brand">Paralegal UI</span>
                </div>
                <div className="navbar-right">
                    {view === 'history' && (<button
                        type="button"
                        className={'nav-tab'}
                        onClick={() => setView('mask')}
                    >
                        Anonymize
                    </button>)}
                    {view === 'mask' && (<button
                        type="button"
                        className={'nav-tab'}
                        onClick={() => setView('history')}
                    >
                        History
                    </button>)}
                    {view === 'mask' && (
                    <>
                    <span className="navbar-label">Masking mode:</span>
                    <select
                        value={maskingMode}
                        onChange={(e) => setMaskingMode(e.target.value as MaskingMode)}
                    >
                        <option value="readable_full">Readable Full</option>
                        <option value="full">Full</option>
                        <option value="keep_tail">Keep tail</option>
                        <option value="keep_head_tail">Keep head &amp; tail</option>
                    </select>

                    {(maskingMode === 'keep_tail' ||
                        maskingMode === 'keep_head_tail') && (
                        <input
                            type="number"
                            min={1}
                            max={16}
                            value={tailLength}
                            onChange={(e) =>
                                setTailLength(parseInt(e.target.value || '4', 10))
                            }
                            className="tail-input"
                            title="Tail length"
                        />
                    )}
                    </>
                    )}
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <main className="main">

                {view === 'mask' ? (
                    <div className="anonymizing-panel">
                        <section className="left-panel">
                            <form onSubmit={handleSubmit} className="form">
                                {/* Choices */}
                                <div className="form-group">
                                    <label>Data types to mask</label>
                                    <div className="choices-grid">
                                        {ALL_KINDS.map((k) => (
                                            <label key={k.id} className="choice-item">
                                                <input
                                                    type="checkbox"
                                                    checked={choices.includes(k.id)}
                                                    onChange={() => toggleChoice(k.id)}
                                                />
                                                <span>{k.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom queries */}
                                <div className="form-group">
                                    <label>Custom queries (for LLM)</label>
                                    <div className="custom-query-input">
                                        <input
                                            type="text"
                                            value={customQueryInput}
                                            onChange={(e) => setCustomQueryInput(e.target.value)}
                                            placeholder="e.g. 'имена людей'"
                                        />
                                        <button type="button" onClick={addCustomQuery}>
                                            +
                                        </button>
                                    </div>
                                    {customQueries.length > 0 && (
                                        <ul className="custom-query-list">
                                            {customQueries.map((q, i) => (
                                                <li key={i}>
                                                    <span>{q}</span>
                                                    <button type="button" onClick={() => removeCustomQuery(i)}>
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Input text */}
                                <div className="form-group">
                                    <label>Input text</label>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        rows={10}
                                        placeholder="Paste text to anonymize..."
                                    />
                                </div>

                                {/* Submit */}
                                <div className="form-actions">
                                    <button type="submit" disabled={loading || !inputText.trim()}>
                                        {loading ? 'Processing…' : 'Run anonymization'}
                                    </button>
                                </div>

                                {error && <div className="error">{error}</div>}
                            </form>
                        </section>

                        {/* RESULT PANEL */}
                        <section className="right-panel">
                            <div className="result-block">
                                <h2>Final text</h2>
                                {result ? (
                                    <pre className="final-text">{result.finalText}</pre>
                                ) : (
                                    <div className="placeholder">Result will appear here</div>
                                )}
                            </div>
                            <div className="result-block">
                                <h2>Changes</h2>
                                {changes.length === 0 ? (
                                    <div className="placeholder">No changes yet</div>
                                ) : (
                                    <ChangesTable changes={changes} />
                                )}
                            </div>
                        </section>
                    </div>
                ) : (
                    // история — можно на всю ширину
                    <section className="full-width-panel">
                        <TransactionsHistory />
                    </section>
                )}
            </main>
        </div>
    );
};

export default App;
