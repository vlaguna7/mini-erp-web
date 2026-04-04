import React from 'react';
import styles from './ProcessingOverlay.module.css';

interface ProcessingOverlayProps {
  /** Texto principal exibido abaixo do spinner */
  message?: string;
  /** Subtítulo menor exibido abaixo da mensagem */
  subtitle?: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  message = 'Processando...',
  subtitle,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner} />
          <div className={styles.spinnerInner} />
        </div>
        <p className={styles.message}>{message}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default ProcessingOverlay;
