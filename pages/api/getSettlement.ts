import type { NextApiRequest, NextApiResponse } from "next";

type SettlementData = {
  merchantId: string;
  date: string;
  settlementAmount: number;
  transactions: Transaction[];
};

type Transaction = {
  id: string;
  amount: string;
  type: 'SALE' | 'REFUND';
  created_at: string;
};

const API_BASE_URL = 'https://api-engine-dev.clerq.io/tech_assessment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettlementData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { merchantId, date } = req.query;

  if (!merchantId || !date) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const settlementData = await getSettlementData(merchantId as string, date as string);
    res.status(200).json(settlementData);
  } catch (error) {
    console.error('Error processing settlement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getSettlementData(merchantId: string, date: string): Promise<SettlementData> {
  const transactions = await fetchTransactions(merchantId, date);
  const settlementAmount = calculateSettlementAmount(transactions);

  return {
    merchantId,
    date,
    settlementAmount,
    transactions,
  };
}

async function fetchTransactions(merchantId: string, date: string): Promise<Transaction[]> {
  const url = new URL(`${API_BASE_URL}/transactions/`);
  url.searchParams.append('merchant', merchantId);
  url.searchParams.append('created_at__gte', `${date}T00:00:00Z`);
  url.searchParams.append('created_at__lt', `${date}T23:59:59Z`);

  let response = await fetch(url.toString());
  let maxTries = 5; // max number of tries to fetch the data (prevent stall)

  while (!response.ok && maxTries > 0) {
    response = await fetch(url.toString());
    maxTries--;
  }

  const data = await response.json();
  return data.results;
}

function calculateSettlementAmount(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction.amount);
    return total + (transaction.type === 'SALE' ? amount : -amount);
  }, 0);
}