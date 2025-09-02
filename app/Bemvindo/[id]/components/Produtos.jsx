"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente para o Painel de Detalhes do Produto ---
const ProductDetailPanel = ({ product, onEdit, onDelete, onClose }) => {
    // Hook para buscar os lotes associados a este produto
    const { data: batches, loading } = useApi(() => 
        product ? api.get(`products/${product.id}/batches`) : Promise.resolve([]),
        [product]
    );

    if (!product) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um produto para ver os detalhes</p>
            </div>
        );
    }

    return (
        <motion.div 
            className={styles.detailPanel}
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className={styles.panelHeader}>
                <h3>Detalhes do Produto</h3>
                <button onClick={onClose} className={styles.closePanelButton}>×</button>
            </div>
            <div className={styles.panelBody}>
                <h4>{product.name}</h4>
                <p><strong>SKU:</strong> {product.sku || 'Não informado'}</p>
                <p><strong>Descrição:</strong> {product.description || 'Nenhuma descrição.'}</p>
                
                <div className={styles.kpiGridSmall}>
                    <div className={styles.kpiCardSmall}>
                        <span>Preço de Venda</span>
                        <strong>{(product.sale_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                    <div className={styles.kpiCardSmall}>
                        <span>Em Estoque</span>
                        <strong>{product.stock_level} unidades</strong>
                    </div>
                </div>

                <div className={styles.historySection}>
                    <h5>Lotes e Validades</h5>
                    {loading ? <p>Carregando lotes...</p> : (
                        <ul>
                            {batches && batches.length > 0 ? (
                                batches.map(batch => (
                                    <li key={batch.id}>
                                        Lote {batch.batch_number || 'N/D'}: {batch.quantity} un. 
                                        {batch.expiration_date && ` (Val: ${format(parseISO(batch.expiration_date), 'dd/MM/yy')})`}
                                    </li>
                                ))
                            ) : (
                                <li>Nenhum lote cadastrado.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
            <div className={styles.panelFooter}>
                <button className={styles.actionButton} onClick={() => onEdit(product)}>Editar</button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(product)}>Excluir</button>
            </div>
        </motion.div>
    );
};


// --- Componente Principal da Aba Produtos ---
const Produtos = ({ establishmentId, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [selectedProduct, setSelectedProduct] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: products, loading, error } = useApi(() => 
        api.get('products', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig]
    );
    
    const columns = useMemo(() => [
        { key: 'name', label: 'Produto' },
        { key: 'sku', label: 'SKU' },
        { key: 'sale_price', label: 'Preço', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { key: 'stock_level', label: 'Estoque' },
    ], []);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className={styles.crmContainer}>
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou SKU..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Produto</button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <Table
                    columns={columns}
                    data={products}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={(prod) => setSelectedProduct(prod)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    rowKey="id"
                    selectedRowId={selectedProduct?.id}
                />
            </div>
            
            <ProductDetailPanel 
                product={selectedProduct} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default Produtos;