import { useState, FormEvent, useEffect } from 'react';
import styles from '../styles/uplode-idea.module.css';

interface Idea {
  id: string;
  title: string;
  idea: string;
  file?: string;
  userAddress?: string;
}

const UploadIdea = () => {
  const [idea, setIdea] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [ideasList, setIdeasList] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [expandedIdea, setExpandedIdea] = useState<Idea | null>(null);

  // Fetch ideas when the account changes
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!account) return;

      try {
        const response = await fetch(`http://localhost:5000/ideas/${account}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ideas');
        }
        const data = await response.json();
        setIdeasList(data.map((item: any) => ({
          id: item._id,
          title: item.title,
          idea: item.idea,
          file: item.file,
          userAddress: item.userAddress,
        })));
      } catch (error) {
        console.error('Error fetching ideas:', error);
        setError('Failed to fetch ideas');
      }
    };
    fetchIdeas();
  }, [account]);

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const fetchedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Fetched accounts:', fetchedAccounts);
        if (fetchedAccounts.length > 0) {
          setAccounts(fetchedAccounts);
          setAccount(fetchedAccounts[0]);
          setIdeasList([]); // Clear previous ideas when connecting a new account
        }
      } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        setError('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      setError('Please install MetaMask to use this feature.');
    }
  };

  const handleAccountChange = (selectedAccount: string) => {
    setAccount(selectedAccount);
    setIdeasList([]); // Clear ideas when switching accounts
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!title.trim()) {
        throw new Error('Please enter a valid title.');
      }

      if (!idea.trim()) {
        throw new Error('Please enter a valid idea.');
      }

      if (!account) {
        throw new Error('You must connect to MetaMask first.');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('idea', idea);
      formData.append('userAddress', account);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('http://localhost:5000/ideas', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error('Response error:', responseBody);
        throw new Error('Failed to submit your idea.');
      }

      const newIdea = await response.json();
      setIdeasList((prevIdeas) => [...prevIdeas, newIdea]);
      setSuccess(true);
      setTitle('');
      setIdea('');
      setFile(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to submit your idea. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const scrollLeft = () => {
    const container = document.getElementById('ideasContainer');
    if (container) {
      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('ideasContainer');
    if (container) {
      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
    }
  };

  const handleReadMore = (idea: Idea) => {
    setExpandedIdea(idea);
  };

  const closeExpandedIdea = () => {
    setExpandedIdea(null);
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length > 0) {
        setAccount(accounts[0]); // Set the first account
        setIdeasList([]); // Clear ideas when switching accounts
      } else {
        console.log('Please connect to MetaMask.');
      }
    };

    // Add the event listener
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      // Cleanup the event listener on component unmount
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload Your Idea</h1>
      <button className={styles.button} onClick={connectMetaMask}>Connect MetaMask</button>
      {accounts.length > 0 ? (
        <div>
          <p className={styles.accountInfo}>Connected Accounts:</p>
          <ul className={styles.accountList}>
            {accounts.map((acc) => (
              <li key={acc} className={styles.accountItem}>
                <button onClick={() => handleAccountChange(acc)} className={styles.button}>
                  {acc}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Please connect your MetaMask account.</p>
      )}
      {account && <p className={styles.accountInfo}>Selected Account: {account}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.textarea}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea Title"
          required
        />
        <textarea
          className={styles.textarea}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="Write your idea here..."
          required
        />
        <input
          className={styles.fileInput}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Idea'}
        </button>
      </form>
      {error && <p className={styles.error}>Error: {error}</p>}
      {success && <p className={styles.success}>Idea Uploaded successfully!</p>}

      <h2 className={styles.subtitle}>Your Uploaded Ideas:</h2>
      <div className={styles.scrollContainer}>
        <button className={styles.scrollButton} onClick={scrollLeft}>←</button>
        <div className={styles.ideasContainer} id="ideasContainer">
          {ideasList.length === 0 ? (
            <p>No ideas uploaded yet.</p>
          ) : (
            ideasList.map((item) => (
              <div key={item.id} className={styles.ideaBox}>
                <div className={styles.ideaContent}>
                  <h3>{item.title}</h3>
                  <p>{item.idea.length > 100 ? item.idea.slice(0, 100) + '...' : item.idea}</p>
                  <button onClick={() => handleReadMore(item)} className={styles.button}>Read More</button>
                </div>
              </div>
            ))
          )}
        </div>
        <button className={styles.scrollButton} onClick={scrollRight}>→</button>
      </div>

      {/* Modal for expanded idea */}
      {expandedIdea && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{expandedIdea.title}</h2>
            <p>{expandedIdea.idea}</p>
            {expandedIdea.file && (
              <div>
                <h4>Attached File:</h4>
                <a href={expandedIdea.file} target="_blank" rel="noopener noreferrer">View File</a>
              </div>
            )}
            <button onClick={closeExpandedIdea} className={styles.button}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadIdea;
