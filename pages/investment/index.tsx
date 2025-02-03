// components/InvestmentModal.tsx

import { useState } from 'react';
import styles from 'styles/investment.module.css'; // Corrected import statement
import { useAccount } from 'wagmi'; // Import useAccount from wagmi

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvest: (amount: number, currency: string) => void;
  ideaId: string;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onInvest, ideaId }) => {
  const { isConnected, address } = useAccount(); // Access wallet connection state using wagmi
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('Btc');

  // Define currency options
  const currencyOptions = [
    { value: 'Btc', label: 'Bitcoin' },
    { value: 'Etc', label: 'Ethereum' },
    { value: 'Pi', label: 'Pi' },
    // Add more currencies as needed
  ];

  const handleSubmit = () => {
    if (amount > 0) {
      onInvest(amount, currency);
      onClose(); // Close the modal after investment
    }
  };

  if (!isOpen || !isConnected) return null; // Only show modal if connected

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Invest in Idea</h2>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="0"
            placeholder="Enter amount"
          />
        </label>
        <label>
          Currency:
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleSubmit}>Invest</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default InvestmentModal;
