"use client";

/**
 * @module components/Produtos
 * @description Componente para gerenciar a lista de produtos de um estabelecimento.
 * Permite visualização, busca, ordenação e disparo de ações de CRUD para produtos.
 */

// Importações de dependências
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';

// Importações de Módulos e Componentes Locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
// CORREÇÃO: Importamos `useApi` usando chaves `{}`.
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente para o Painel de Detalhes do Produto ---
/**
 * Painel lateral que exibe informações detalhadas de um produto selecionado.
 * @param {{
 * product: object | null,
 * onEdit: (item: object) => void,
 * onDelete: (item: object) => void,
 * onClose: () => void
 * }} props
 * @returns {JSX.Element}
 */
const ProductDetailPanel = ({ product, onEdit, onDelete, onClose }) => {
    // Hook para buscar os lotes associados a este produto
    // A chamada só é feita se `product` existir.
    const { data: batches, loading: batchesLoading } = useApi(() => 
        product ? api.get(`products/${product.id}/batches`) : Promise.resolve([]),
        [product]
    );

    // Renderização de um placeholder se nenhum produto estiver selecionado.
    if (!product) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um produto da lista para ver os detalhes.</p>
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
                            <strong>{product.stock_level || 0} unidades</strong>
                        </div>
                    </div>

                    <div className={styles.historySection}>
                        <h5>Lotes e Validades</h5>
                        {batchesLoading ? <p className={styles.loadingText}>Carregando lotes...</p> : (
                            <ul>
                                {batches && batches.length > 0 ? (
                                    batches.map(batch => (
                                        <li key={batch.id}>
                                            Lote {batch.batch_number || 'N/D'}: {batch.quantity} un. 
                                            {batch.expiration_date && ` (Val: ${format(parseISO(batch.expiration_date), 'dd/MM/yy')})`}
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.emptyText}>Nenhum lote cadastrado para este produto.</li>
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
        </AnimatePresence>
    );
};


// --- Componente Principal da Aba Produtos ---
/**
 * Orquestrador da aba de Produtos.
 * @param {{
 * establishmentId: string,
 * onAdd: () => void,
 * onEdit: (item: object) => void,
 * onDelete: (item: object) => void,
 * keyForReRender: number
 * }} props
 * @returns {JSX.Element}
 */
const Produtos = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estados para controlar a UI
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Debounce para otimizar a busca
    const debouncedSearchTerm = useDebounce(searchTerm, 350);

    // Hook `useApi` para buscar os produtos.
    // A importação correta (`import { useApi }`) garante que isso funcione.
    const { data: products, loading, error } = useApi(() => 
        api.get('products', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
    );
    
    // Definição das colunas da tabela, memoizada para performance.
    const columns = useMemo(() => [
        { key: 'name', label: 'Produto' },
        { key: 'sku', label: 'SKU' },
        { key: 'sale_price', label: 'Preço', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { key: 'stock_level', label: 'Estoque', render: (value) => `${value || 0} un.` },
    ], []);

    // Função para lidar com a ordenação da tabela.
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };
    
    // Efeito para limpar o painel de detalhes se o produto selecionado for deletado.
    useEffect(() => {
        if (selectedProduct && products && !products.some(p => p.id === selectedProduct.id)) {
            setSelectedProduct(null);
        }
    }, [products, selectedProduct]);

    return (
        <div className={styles.crmContainer}>
            {/* Painel da Esquerda: Lista */}
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar produtos por nome ou SKU..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Campo de busca de produtos"
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Produto</button>
                </div>

                {error && <p className={styles.errorState}>{error}</p>}
                
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