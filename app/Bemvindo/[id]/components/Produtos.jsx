"use client";

/**
 * @module components/Produtos
 * @description Componente de gerenciamento para a entidade "Produtos".
 * Orquestra a lista, painel de detalhes, busca e ações de CRUD para produtos.
 */

// Core do React e bibliotecas
import React, { useState, useMemo, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'; // Ícones

// Módulos e Componentes locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente Otimizado: Painel de Detalhes do Produto ---
/**
 * Painel lateral que exibe informações detalhadas de um produto.
 * Otimizado com React.memo.
 * @param {{ product: object | null, ... }} props
 */
const ProductDetailPanel = memo(({ product, onEdit, onDelete, onClose }) => {
    // *** CORREÇÃO APLICADA AQUI ***
    // A chamada foi ajustada para usar um método específico do SDK, como `getBatches(productId)`.
    const { data: batches, loading: batchesLoading, error: batchesError } = useApi(() => 
        product ? api.products.getBatches(product.id) : null,
        [product]
    );

    if (!product) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um produto para ver os detalhes.</p>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                className={styles.detailPanel}
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div className={styles.panelHeader}>
                    <h3>Detalhes do Produto</h3>
                    <button onClick={onClose} className={styles.closePanelButton} aria-label="Fechar painel">×</button>
                </div>
                <div className={styles.panelBody}>
                    <h4>{product.name}</h4>
                    <p><strong>SKU:</strong> {product.sku || 'Não informado'}</p>
                    <p><strong>Descrição:</strong> {product.description || 'Nenhuma descrição.'}</p>
                    
                    <div className={styles.kpiGridSmall}>
                        <div className={styles.kpiCardSmall}>
                            <span>Preço de Venda</span>
                            <strong>{(Number(product.sale_price) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                        </div>
                        <div className={styles.kpiCardSmall}>
                            <span>Em Estoque</span>
                            <strong>{product.stock_level || 0} unidades</strong>
                        </div>
                    </div>

                    <div className={styles.historySection}>
                        <h5>Lotes e Validades</h5>
                        {batchesLoading && <p className={styles.loadingText}>Carregando lotes...</p>}
                        {batchesError && <p className={styles.errorText}>Erro ao buscar lotes.</p>}
                        {!batchesLoading && !batchesError && (
                             <ul className={styles.serviceList}>
                                {batches && batches.length > 0 ? (
                                    batches.map(batch => (
                                        <li key={batch.id}>
                                            Lote {batch.batch_number || 'N/D'}: {batch.quantity} un. 
                                            {batch.expiration_date && ` (Val: ${format(parseISO(batch.expiration_date), 'dd/MM/yy')})`}
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.emptyText}>Nenhum lote cadastrado.</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
                <div className={styles.panelFooter}>
                    <button className={styles.actionButton} onClick={() => onEdit(product)}><FaEdit/> Editar</button>
                    <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(product)}><FaTrash/> Excluir</button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
});
ProductDetailPanel.displayName = 'ProductDetailPanel';

// --- Componente Principal ---
/**
 * Componente container que gerencia a aba de Produtos.
 * @param {{ establishmentId: number, onAdd, onEdit, onDelete, keyForReRender }} props
 */
const Produtos = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estados da UI
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Otimização da busca com debounce
    const debouncedSearchTerm = useDebounce(searchTerm, 350);

    // *** CORREÇÃO APLICADA AQUI ***
    // A chamada à API foi ajustada para usar `api.products.getAll`.
    const { data: products, loading, error } = useApi(() => 
        api.products.getAll({ 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
    );
    
    // Efeito para limpar o painel de detalhes se o produto for removido da lista.
    useEffect(() => {
        if (selectedProduct && products && !products.some(p => p.id === selectedProduct.id)) {
            setSelectedProduct(null);
        }
    }, [products, selectedProduct]);
    
    // Memoização das colunas da tabela para performance.
    const columns = useMemo(() => [
        { key: 'name', label: 'Produto' },
        { key: 'sku', label: 'SKU' },
        { key: 'sale_price', label: 'Preço', render: (value) => (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { key: 'stock_level', label: 'Estoque', render: (value) => `${value || 0} un.` },
    ], []);

    // Função para lidar com a ordenação da tabela.
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className={styles.crmContainer}>
            {/* Painel da Esquerda: Lista de Produtos */}
            <div className={styles.listPanel}>
                <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar produtos por nome ou SKU..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar produtos"
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>
                        <FaPlus style={{ marginRight: '8px' }}/>
                        Novo Produto
                    </button>
                </div>

                {error && <p className={styles.errorState}>Ocorreu um erro ao carregar os produtos: {error}</p>}
                
                <Table
                    columns={columns}
                    data={products}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={setSelectedProduct}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    rowKey="id"
                    selectedRowId={selectedProduct?.id}
                />
            </div>
            
            {/* Painel da Direita: Detalhes */}
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