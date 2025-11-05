
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 flex flex-col items-center justify-center border-b-2 border-yellow-700 bg-black bg-opacity-30">
        <img src="https://tiemvangkimhanh2.com/upload/company/logo0.png" alt="Logo" className="h-20 w-20 mb-2 animate-spin" style={{ animationDuration: '20s' }} />
        <img src="https://tiemvangkimhanh2.com/upload/company/khj2.png" alt="Kim Hanh II Jewelry" className="h-16" />
    </header>
  );
};

export default Header;
