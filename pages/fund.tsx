import { useEffect, useState } from 'react';
import styles from '../styles/fund.module.css';

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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('');

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setError('Failed to connect to MetaMask.');
      }
    } else {
      setError('MetaMask not detected. Please install it.');
    }
  };

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
    connectToMetaMask();
  }, []);

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
    <div className={styles.container}>
      <h1 className={styles.title}>Your Investment Overview</h1>
      {loading ? (
        <p>Loading investments...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : totalInvestmentsByIdea.length === 0 ? (
        <p>No investments found for your uploaded ideas.</p>
      ) : (
        <div className={styles.investmentList}>
          {totalInvestmentsByIdea.map(idea => (
            <div key={idea.id} className={styles.investmentBox}>
              <h3>{idea.title}</h3>
              <p>Total Investment: {idea.total} USD</p>
              <h4>Your funds:</h4>
              <ul>
                {investments
                  .filter(investment => investment.ideaId === idea.id)
                  .map(investment => (
                    <li key={investment.id}>
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
