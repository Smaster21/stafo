// components/InvestmentsPage.tsx

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi'; // Import wagmi hook for account management

interface Investment {
  id: string;
  title: string;
  amount: number;
  currency: string;
  ideaId: string;
  userAddress: string;
}

const currencySymbols: { [key: string]: string } = {
  Btc: '₿',   
  Etc: 'Ξ',   
  Pi: 'π',
};

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState<Investment[]>([]); // Investment state
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string>(''); // Error state
  
  const { address, isConnected } = useAccount(); // Use wagmi hook to get the address and connection status

  const fetchInvestments = async () => {
    if (!address) return;

    try {
      const response = await fetch(`http://localhost:5000/investments?userAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      const data = await response.json();
      setInvestments(data.map((item: any) => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        currency: item.currency,
        ideaId: item.ideaId,
        userAddress: item.userAddress,
      })));
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      setLoading(true);
      fetchInvestments();
    }
  }, [isConnected, address]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Your Investments</h1>

      {!isConnected ? (
        <p className="text-lg">Please connect your wallet to view investments.</p>
      ) : loading ? (
        <p className="text-lg">Loading investments...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : investments.length === 0 ? (
        <p className="text-gray-600">You have no investments.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <div className="bg-white p-6 rounded-lg shadow-md" key={investment.id}>
              <h3 className="text-xl font-semibold mb-2">{investment.title}</h3>
              <p className="text-gray-700">
                Invested {investment.amount} {currencySymbols[investment.currency] || investment.currency} in Idea ID: {investment.ideaId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;
