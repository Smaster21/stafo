// components/InvestmentsPage.tsx

import { useEffect, useState } from 'react';
import styles from '../styles/investo.module.css';

interface Investment {
  id: string;
  title: string;   // Add title to the Investment interface
  amount: number;
  currency: string;
  ideaId: string;
  userAddress: string; // User address for identifying the investment
}

// Mapping of currency codes to their symbols
const currencySymbols: { [key: string]: string } = {
  Btc: '₿',   // Bitcoin
  Etc: 'Ξ',   // Ethereum
  Pi: 'π',    // Pi 
  // Add more currency mappings as needed
};

const InvestmentsPage = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userAddress, setUserAddress] = useState<string>(''); // State to hold user's address
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string>(''); // Error state

  // Function to connect to MetaMask and set user address
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]); // Set the user's address
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setError('Failed to connect to MetaMask.');
      }
    } else {
      setError('MetaMask not detected. Please install it.');
    }
  };

  // Function to fetch investments for the user
  const fetchInvestments = async () => {
    if (!userAddress) return; // Only fetch if userAddress is available

    try {
      const response = await fetch(`http://localhost:5000/investments?userAddress=${userAddress}`); // Fetch investments for the user's address
      if (!response.ok) {
        throw new Error('Failed to fetch investments');
      }
      const data = await response.json();
      setInvestments(data.map((item: any) => ({
        id: item.id,
        title: item.title, // Include title in the fetched data
        amount: item.amount,
        currency: item.currency,
        ideaId: item.ideaId,
        userAddress: item.userAddress, // Capture userAddress if needed
      })));
    } catch (error) {
      console.error('Error fetching investments:', error);
      setError('Failed to fetch investments');
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  useEffect(() => {
    connectToMetaMask(); // Connect to MetaMask on component mount
  }, []); // Only run once on component mount

  // Fetch investments whenever the userAddress changes
  useEffect(() => {
    if (userAddress) {
      setLoading(true); // Set loading to true when fetching data
      fetchInvestments(); // Fetch investments when userAddress is set
    }
  }, [userAddress]); // Dependency array includes userAddress

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Investments</h1>
      {loading ? (
        <p>Loading investments...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : investments.length === 0 ? (
        <p className={styles.emptyMessage}>You have no investments.</p>
      ) : (
        <div className={styles.investmentsContainer}>
          {investments.map((investment) => (
            <div className={styles.investmentBox} key={investment.id}>
              <h3>{investment.title}</h3> {/* Display investment title */}
              <p>
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
