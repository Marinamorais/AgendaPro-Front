import React from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

const ModalContainer = ({ closeModal, children }) => (
  <motion.div className={styles.overlay} onClick={closeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
      <button onClick={closeModal} className={styles.closeButton}>×</button>
      {children}
    </motion.div>
  </motion.div>
);

export default ModalContainer;