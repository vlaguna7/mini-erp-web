import React from 'react';
import './BlankPage.css';

interface BlankPageProps {
  title: string;
}

export const BlankPage: React.FC<BlankPageProps> = ({ title }) => {
  return (
    <>
      <div className="blank-page">
        <div className="blank-page-content">
          <h1>{title}</h1>
          <p>Esta página será desenvolvida em breve.</p>
        </div>
      </div>
    </>
  );
};
