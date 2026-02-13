import { Clock3, DollarSign, TrendingUp } from 'lucide-react';
import type { GoldPrice } from '../services/api';

interface GoldPriceBoardProps {
  goldPrice: GoldPrice | null;
  loading?: boolean;
  errorMessage?: string;
}

const formatVnd = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const formatDate = (value: string): string => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

function GoldPriceBoard({ goldPrice, loading = false, errorMessage = '' }: GoldPriceBoardProps) {
  return (
    <section
      style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 18,
        padding: 16,
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <DollarSign size={20} />
        <h3 style={{ margin: 0, fontSize: 18 }}>Gold Price Board</h3>
      </div>

      {loading ? (
        <p style={{ margin: 0, color: '#cbd5e1' }}>Loading latest gold prices...</p>
      ) : null}

      {!loading && errorMessage ? (
        <p style={{ margin: 0, color: '#fecaca' }}>{errorMessage}</p>
      ) : null}

      {!loading && !errorMessage && goldPrice ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            <article
              style={{
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: 13 }}>Buy Price</span>
              </div>
              <strong style={{ display: 'block', marginTop: 6, fontSize: 17 }}>
                {formatVnd(goldPrice?.buyPrice ?? 0)}
              </strong>
            </article>

            <article
              style={{
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#86efac' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: 13 }}>Sell Price</span>
              </div>
              <strong style={{ display: 'block', marginTop: 6, fontSize: 17 }}>
                {formatVnd(goldPrice?.sellPrice ?? 0)}
              </strong>
            </article>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 13 }}>
            <Clock3 size={14} />
            <span>Updated: {formatDate(goldPrice?.updatedAt || '')}</span>
          </div>
        </>
      ) : null}

      {!loading && !errorMessage && !goldPrice ? (
        <p style={{ margin: 0, color: '#cbd5e1' }}>No gold price data available.</p>
      ) : null}
    </section>
  );
}

export default GoldPriceBoard;

