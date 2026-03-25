import React from 'react';
import styles from './BlankPage.module.css';

interface BlankPageProps {
  title: string;
}

const BlankPage: React.FC<BlankPageProps> = ({ title }) => {
  return (
    <>
      <div className={styles.blankPage}>
        <div className={styles.blankPageContent}>
          <h1>{title}</h1>
          <p>Esta página será desenvolvida em breve.</p>
        </div>
      </div>
    </>
  );
};

export default BlankPage;
