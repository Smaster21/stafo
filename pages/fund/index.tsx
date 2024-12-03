import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi'; // Import useAccount from wagmi
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Import the ConnectButton for wallet connection

interface Investment {
  id: string;
  amount: number;
  currency: string;
  ideaId: string;
  userAddress: string;
}

interface Idea {
  id: string;
  title: string;
  userAddress: string;
}

const FundPage = () => {
  const { isConnected, address: userAddress } = useAccount(); // Get wallet connection status and user address
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch user's uploaded ideas
  const fetchUserIdeas = async () => {
    if (!userAddress) return;
    try {
      const response = await fetch(`http://localhost:5000/ideas/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user ideas');
      }
      const data = await response.json();
      setUserIdeas(data.map((item: any) => ({
        id: item._id,
        title: item.title,
        userAddress: item.userAddress,
      })));
    } catch (error) {
      console.error('Error fetching user ideas:', error);
      setError('Failed to fetch your ideas');
    }
  };

  // Fetch all investments
  const fetchInvestments = async () => {
    try {
      const response = await fetch('http://localhost:5000/investments');
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      const data = await response.json();
      setInvestments(data.map((item: any) => ({
        id: item.id,
        amount: item.amount,
        currency: item.currency,
        ideaId: item.ideaId,
        userAddress: item.userAddress,
      })));
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to fetch investments');
    }
  };

  useEffect(() => {
    if (userAddress) {
      setLoading(true); // Set loading to true when fetching data
      fetchUserIdeas();
      fetchInvestments();
    }
  }, [userAddress]);

  useEffect(() => {
    // Stop loading when investments are fetched
    if (investments.length > 0) {
      setLoading(false);
    }
  }, [investments]);

  const totalInvestmentsByIdea = userIdeas.map(idea => {
    const total = investments
      .filter(investment => investment.ideaId === idea.id)
      .reduce((sum, investment) => sum + investment.amount, 0);
    return { ...idea, total };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Your Investment Overview</h1>
      {!isConnected ?
        <p className="text-lg">Please connect your wallet to view Funds.</p>
        : loading ? (
          <p>Loading investments...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : totalInvestmentsByIdea.length === 0 ? (
          <p>No investments found for your uploaded ideas.</p>
        ) : (
          <div className="space-y-6">
            {totalInvestmentsByIdea.map(idea => (
              <div key={idea.id} className="border p-6 rounded-lg shadow-lg space-y-4">
                <h3 className="text-2xl font-semibold">{idea.title}</h3>
                <p className="text-lg">Total Investment: {idea.total} USD</p>

                <h4 className="font-semibold">Your funds:</h4>
                <ul className="space-y-2">
                  {investments
                    .filter(investment => investment.ideaId === idea.id)
                    .map(investment => (
                      <li key={investment.id} className="text-gray-800">
                        {investment.userAddress} fund {investment.amount} {investment.currency}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default FundPage;