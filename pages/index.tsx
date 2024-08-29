import { useState } from 'react';

type SettlementData = {
  merchantId: string;
  date: string;
  settlementAmount: number;
  transactions: Transaction[];
  error?: string;
};

type Transaction = {
  id: string;
  amount: string;
  type: 'SALE' | 'REFUND';
  created_at: string;
};

export default function Home() {
  const [merchantId, setMerchantId] = useState('');
  const [date, setDate] = useState('');
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSettlementData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/getSettlement?merchantId=${merchantId}&date=${date}`);
      const data: SettlementData = await response.json();
      if (!response.ok) {
        setSettlementData(null)
        throw new Error('Failed to fetch settlement data (' + response.status + ': ' + data.error + ')');
      }
      console.log(data)
      setSettlementData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">ACME Payments Settlement Service</h1>
      <div className="mb-4">
        <label htmlFor="merchantId" className="block text-sm font-medium text-gray-700 mb-1">Merchant ID:</label>
        <input
          id="merchantId"
          type="text"
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button 
        onClick={fetchSettlementData} 
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Fetch Settlement Data'}
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {settlementData && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-semibold text-gray-800">Settlement Data</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Merchant ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{settlementData.merchantId}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{settlementData.date}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Settlement Amount</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${settlementData.settlementAmount.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
            <ul className="mt-4 divide-y divide-gray-200">
              {settlementData.transactions.map((transaction) => (
                <li key={transaction.id} className="py-4">
                  <div className="flex justify-between">
                    <span className={`font-medium ${transaction.type === 'SALE' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type}
                    </span>
                    <span className="text-gray-900">{transaction.type === 'SALE' ? '' : '-'}${transaction.amount}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}