import React from 'react';
import { UserCog } from 'lucide-react';

// Thêm Props để nhận hàm click từ App.tsx
interface Props {
    onUpdateInfoClick: () => void;
}

const Header: React.FC<Props> = ({ onUpdateInfoClick }) => {
    return (
        // Thêm 'relative' để định vị nút
        <header className="relative p-3 md:p-4 flex flex-col items-center justify-center border-b border-yellow-700/70 bg-black/20 backdrop-blur-[1px]">
            <img
                src="https://tiemvangkimhanh2.com/upload/company/logo0.png"
                alt="Logo"
                className="h-14 w-14 md:h-16 md:w-16 mb-1 animate-spin"
                style={{ animationDuration: '26s' }}
            />
            <img src="https://tiemvangkimhanh2.com/upload/company/khj2.png" alt="Kim Hanh II Jewelry" className="h-10 md:h-12" />

            {/* Nút "Cập nhật thông tin" (theo ý bạn) */}
            <button
                onClick={onUpdateInfoClick}
                className="absolute top-3 right-3 p-2 text-yellow-400 hover:text-yellow-200 rounded-full transition-colors"
                title="Cập nhật thông tin AI"
            >
                <UserCog size={20} />
            </button>
        </header>
    );
};

export default Header;
