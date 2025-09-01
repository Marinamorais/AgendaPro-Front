"use client";

import React from 'react';
import styles from '../BemVindo.module.css';

const Table = ({ 
    columns, 
    data, 
    loading, 
    onSort, 
    sortConfig, 
    onRowClick, 
    onEdit, 
    onDelete,
    rowKey,
    selectedRowId,
}) => {

    const renderCell = (item, column) => {
        const value = item[column.key];
        return column.render ? column.render(value, item) : value;
    };

    const SortIcon = ({ direction }) => {
        if (!direction) return null;
        return direction === 'ascending' ? ' ▲' : ' ▼';
    };

    if (loading) {
        return <div className={styles.loadingState}>Carregando dados...</div>;
    }

    if (!data || data.length === 0) {
        return <div className={styles.emptyState}>Nenhum resultado encontrado.</div>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} onClick={() => onSort && onSort(col.key)}>
                                {col.label}
                                {sortConfig && sortConfig.key === col.key && <SortIcon direction={sortConfig.direction} />}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th>Ações</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr 
                            key={item[rowKey]} 
                            onClick={() => onRowClick && onRowClick(item)}
                            className={selectedRowId === item[rowKey] ? styles.selectedRow : ''}
                        >
                            {columns.map(col => (
                                <td key={`${item[rowKey]}-${col.key}`}>
                                    {renderCell(item, col)}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className={styles.actionsCell}>
                                    {onEdit && <button className={styles.actionButtonSmall} onClick={(e) => { e.stopPropagation(); onEdit(item); }}>Editar</button>}
                                    {onDelete && <button className={`${styles.actionButtonSmall} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); onDelete(item); }}>Excluir</button>}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;