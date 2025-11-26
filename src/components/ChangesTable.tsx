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
                {changes.map((change, i) => {
                    return (
                        <tr key={i}>
                            <td>{i + 1}</td>

                            <td>
                                {change.beforeDetails.contextBefore}
                                <span className="highlight">{change.before}</span>
                                {change.beforeDetails.contextAfter}
                            </td>

                            <td>
                                {change.afterDetails.contextBefore}
                                <span className="highlight">{change.after}</span>
                                {change.afterDetails.contextAfter}
                            </td>

                            <td>{change.actor}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};
