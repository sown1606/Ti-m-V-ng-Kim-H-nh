import React, { useState } from 'react';
import { User, PurchaseType, PersonInfo } from '../types';

interface Props {
  onSubmit: (user: User) => void;
}

const UserInfoModal: React.FC<Props> = ({ onSubmit }) => {
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(PurchaseType.REGULAR);
  const [primaryInfo, setPrimaryInfo] = useState<PersonInfo>({ name: '', dob: '' });
  const [partnerInfo, setPartnerInfo] = useState<PersonInfo>({ name: '', dob: '' });
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryInfo({ ...primaryInfo, [e.target.name]: e.target.value });
  };

  const handlePartnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerInfo({ ...partnerInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryInfo.name || !primaryInfo.dob || !phone) {
      setError('Vui lòng điền đầy đủ thông tin của bạn.');
      return;
    }
    if (purchaseType === PurchaseType.WEDDING && (!partnerInfo.name || !partnerInfo.dob)) {
      setError('Vui lòng điền đầy đủ thông tin của cả hai vợ chồng.');
      return;
    }

    const userData: User = {
      purchaseType,
      primary: primaryInfo,
      phone,
      ...(purchaseType === PurchaseType.WEDDING && { partner: partnerInfo }),
    };
    onSubmit(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-yellow-600 rounded-lg shadow-2xl p-8 w-full max-w-lg text-yellow-50">
        <h2 className="text-3xl font-bold text-center mb-2 text-yellow-400">Chào mừng đến với Kim Hạnh II</h2>
        <p className="text-center text-gray-300 mb-6">Vui lòng cung cấp thông tin để nhận tư vấn phong thủy tốt nhất.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-yellow-400 mb-2">Bạn muốn mua vàng cho dịp nào?</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPurchaseType(PurchaseType.REGULAR)}
                className={`w-full py-2 px-4 rounded transition ${purchaseType === PurchaseType.REGULAR ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Mua sắm thông thường
              </button>
              <button
                type="button"
                onClick={() => setPurchaseType(PurchaseType.WEDDING)}
                className={`w-full py-2 px-4 rounded transition ${purchaseType === PurchaseType.WEDDING ? 'bg-yellow-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Trang sức cưới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fieldset className="border border-gray-600 p-4 rounded col-span-2 md:col-span-1">
              <legend className="px-2 text-yellow-500">{purchaseType === PurchaseType.WEDDING ? "Thông tin Chú rể" : "Thông tin của bạn"}</legend>
              <input type="text" name="name" placeholder="Họ và tên" value={primaryInfo.name} onChange={handlePrimaryChange} className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2" />
              <input type="date" name="dob" value={primaryInfo.dob} onChange={handlePrimaryChange} className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </fieldset>

            {purchaseType === PurchaseType.WEDDING && (
              <fieldset className="border border-gray-600 p-4 rounded col-span-2 md:col-span-1">
                <legend className="px-2 text-yellow-500">Thông tin Cô dâu</legend>
                <input type="text" name="name" placeholder="Họ và tên" value={partnerInfo.name} onChange={handlePartnerChange} className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2" />
                <input type="date" name="dob" value={partnerInfo.dob} onChange={handlePartnerChange} className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
              </fieldset>
            )}
             <div className="col-span-2">
                 <input type="tel" name="phone" placeholder="Số điện thoại (để lưu bộ sưu tập)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"/>
            </div>
          </div>
          
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          
          <button type="submit" className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded transition-transform transform hover:scale-105">
            Bắt đầu thiết kế
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;