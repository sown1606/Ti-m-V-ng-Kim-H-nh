import React from 'react';
import { UserCog } from 'lucide-react';

// Thêm Props để nhận hàm click từ App.tsx
interface Props {
    onUpdateInfoClick: () => void;
}

const Header: React.FC<Props> = ({ onUpdateInfoClick }) => {
    return (
        // Thêm 'relative' để định vị nút
        <header className="relative p-4 flex flex-col items-center justify-center border-b-2 border-yellow-700 bg-black bg-opacity-30">
            <img src="https://tiemvangkimhanh2.com/upload/company/logo0.png" alt="Logo" className="h-20 w-20 mb-2 animate-spin" style={{ animationDuration: '20s' }} />
            <img src="https://tiemvangkimhanh2.com/upload/company/khj2.png" alt="Kim Hanh II Jewelry" className="h-16" />

            {/* Nút "Cập nhật thông tin" (theo ý bạn) */}
            <button
                onClick={onUpdateInfoClick}
                className="absolute top-4 right-4 p-2 text-yellow-400 hover:text-yellow-200 rounded-full transition-colors"
                title="Cập nhật thông tin AI"
            >
                <UserCog size={24} />
            </button>
        </header>
    );
};

export default Header;
