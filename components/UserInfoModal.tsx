import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { X } from 'lucide-react';

interface Props {
  initialUser: User | null;
  onSubmit: (user: User) => void;
  onClose: () => void;
}

const defaultUser: User = {
  phone: '',
  primary: {
    name: '',
    dob: '',
  },
  purchaseType: 'regular' as User['purchaseType'],
};

const UserInfoModal: React.FC<Props> = ({ initialUser, onSubmit, onClose }) => {
  const [form, setForm] = useState<User>(initialUser || defaultUser);

  useEffect(() => {
    if (initialUser) {
      setForm(initialUser);
    }
  }, [initialUser]);

  const handleChangePrimary = (field: 'name' | 'dob', value: string) => {
    setForm((prev) => ({
      ...prev,
      primary: {
        ...prev.primary,
        [field]: value,
      },
    }));
  };

  const handleChangePartner = (field: 'name' | 'dob', value: string) => {
    setForm((prev) => ({
      ...prev,
      partner: {
        ...(prev.partner || { name: '', dob: '' }),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.primary?.name || !form.primary?.dob) {
      alert('Vui lòng nhập đủ Họ tên, Ngày sinh và Số điện thoại.');
      return;
    }
    onSubmit(form);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="relative w-full max-w-5xl mx-4 bg-gradient-to-br from-black via-gray-900 to-black border border-yellow-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Nút đóng */}
          <button
              onClick={onClose}
              className="absolute top-3 right-3 text-yellow-300 hover:text-yellow-100"
          >
            <X size={22} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Cột quảng cáo / popup */}
            <div className="p-6 bg-gradient-to-br from-red-900/80 via-red-800/80 to-red-900/80 border-r border-yellow-700 hidden md:flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-3">
                  Ưu đãi hôm nay tại Kim Hạnh II
                </h2>
                <p className="text-yellow-100 text-sm mb-4">
                  Thông tin bên trái khu này có thể lấy từ Strapi (Popup Ads):
                  text giới thiệu, hình ảnh hoặc video khuyến mãi.
                </p>

                {/* Placeholder cho hình ảnh quảng cáo */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-yellow-600 bg-black/40 flex items-center justify-center">
                <span className="text-yellow-200 text-xs text-center px-4">
                  Khu vực hiển thị hình ảnh / video quảng cáo
                  <br />
                  (cấu hình trong Strapi &ldquo;Popup Ads&rdquo;).
                </span>
                </div>
              </div>

              <div className="mt-6 text-xs text-yellow-300/80">
                Địa chỉ: 1276 Kha Vạn Cân, P.Linh Trung, TP.Thủ Đức, TP.HCM.
              </div>
            </div>

            {/* Cột form thông tin */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-yellow-300 mb-4">
                Thông tin để KimHanh_II AI tư vấn phong thủy
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ tên + ngày sinh */}
                <div className="space-y-2">
                  <label className="block text-sm text-yellow-200">
                    Họ và tên (người đeo)
                  </label>
                  <input
                      type="text"
                      value={form.primary?.name || ''}
                      onChange={(e) => handleChangePrimary('name', e.target.value)}
                      className="w-full rounded-md bg-black/50 border border-yellow-600 px-3 py-2 text-yellow-50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="VD: Kiet Nguyen"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-yellow-200">
                    Ngày sinh (dương lịch)
                  </label>
                  {/* Cho phép nhập tay luôn */}
                  <input
                      type="text"
                      value={form.primary?.dob || ''}
                      onChange={(e) => handleChangePrimary('dob', e.target.value)}
                      className="w-full rounded-md bg-black/50 border border-yellow-600 px-3 py-2 text-yellow-50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="VD: 11/11/1995 hoặc 1995-11-11"
                  />
                </div>

                {/* SĐT */}
                <div className="space-y-2">
                  <label className="block text-sm text-yellow-200">
                    Số điện thoại
                  </label>
                  <input
                      type="tel"
                      value={form.phone || ''}
                      onChange={(e) =>
                          setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full rounded-md bg-black/50 border border-yellow-600 px-3 py-2 text-yellow-50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="VD: 0909 xxx xxx"
                  />
                </div>

                {/* Loại mua */}
                <div className="space-y-2">
                  <label className="block text-sm text-yellow-200">
                    Mục đích mua
                  </label>
                  <div className="flex gap-4 text-sm text-yellow-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="radio"
                          name="purchaseType"
                          value="regular"
                          checked={form.purchaseType === 'regular'}
                          onChange={() =>
      setForm((prev: User): User => ({
        ...prev,
        purchaseType: 'regular' as User['purchaseType'],
      }))
                          }
                      />
                      <span>Đeo bình thường / tích lũy</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="radio"
                          name="purchaseType"
                          value="wedding"
                          checked={form.purchaseType === 'wedding'}
                          onChange={() =>
      setForm((prev: User): User => ({
        ...prev,
        purchaseType: 'wedding' as User['purchaseType'],
      }))
                          }
                      />
                      <span>Trang sức cưới</span>
                    </label>
                  </div>
                </div>

                {/* Thông tin người phối ngẫu (nếu cưới) */}
                {form.purchaseType === 'wedding' && (
                    <div className="mt-2 border-t border-yellow-700 pt-3 space-y-3">
                      <p className="text-sm text-yellow-300 font-semibold">
                        Thông tin người phối ngẫu (vợ/chồng)
                      </p>
                      <div className="space-y-2">
                        <label className="block text-sm text-yellow-200">
                          Họ và tên
                        </label>
                        <input
                            type="text"
                            value={form.partner?.name || ''}
                            onChange={(e) =>
                                handleChangePartner('name', e.target.value)
                            }
                            className="w-full rounded-md bg-black/50 border border-yellow-600 px-3 py-2 text-yellow-50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="VD: Nguyen Thi A"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-yellow-200">
                          Ngày sinh (dương lịch)
                        </label>
                        <input
                            type="text"
                            value={form.partner?.dob || ''}
                            onChange={(e) =>
                                handleChangePartner('dob', e.target.value)
                            }
                            className="w-full rounded-md bg-black/50 border border-yellow-600 px-3 py-2 text-yellow-50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="VD: 20/10/1996 hoặc 1996-10-20"
                        />
                      </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-md bg-gray-700 text-gray-200 text-sm hover:bg-gray-600"
                  >
                    Để sau
                  </button>
                  <button
                      type="submit"
                      className="px-5 py-2 rounded-md bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400"
                  >
                    Lưu & Bắt đầu tư vấn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UserInfoModal;
