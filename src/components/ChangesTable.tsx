// src/components/ChangesTable.tsx
import React from 'react';
import type {Change} from "../types.ts";

interface ChangesTableProps {
    changes: Change[];
}

export const ChangesTable: React.FC<ChangesTableProps> = ({ changes }) => {
    return (
        <div className="table-wrapper">
            <table className="changes-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Actor</th>
                </tr>
                </thead>
                <tbody>
                {changes.map((c, i) => {
                    const ctxBefore = c.contextBefore ?? '';
                    const ctxAfter = c.contextAfter ?? '';

                    return (
                        <tr key={i}>
                            <td>{i + 1}</td>

                            <td>
                                {ctxBefore}
                                <span className="highlight">{c.before}</span>
                                {ctxAfter}
                            </td>

                            <td>
                                {ctxBefore}
                                <span className="highlight">{c.after}</span>
                                {ctxAfter}
                            </td>

                            <td>{c.actor}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};
