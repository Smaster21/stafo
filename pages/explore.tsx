import { useEffect, useState } from 'react';
import styles from '../styles/explore.module.css';
import InvestmentModal from '../pages/investment';

interface Idea {
  id: string;
  title: string;
  idea: string;
  file?: string; // Assuming 'file' can be an image or a video URL
  userAddress?: string;
}

const ExplorePage = () => {
  const [publicIdeas, setPublicIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]); // State to track expanded ideas
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search input
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal visibility
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(''); // State to hold selected idea id

  useEffect(() => {
    const fetchPublicIdeas = async () => {
      try {
        const response = await fetch('http://localhost:5000/ideas'); // Ensure the API is running
        if (!response.ok) {
          throw new Error('Failed to fetch public ideas');
        }
        const data = await response.json();
        setPublicIdeas(data.map((item: any) => ({
          id: item._id,
          title: item.title,
          idea: item.idea,
          file: item.file,
          userAddress: item.userAddress,
        })));
      } catch (error) {
        console.error('Error fetching public ideas:', error);
        setError('Failed to fetch public ideas');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicIdeas();
  }, []);

  // Function to toggle expanded state
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(expandedId => expandedId !== id) : [...prev, id]
    );
  };

  // Function to open investment modal
  const openInvestmentModal = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setIsModalOpen(true);
  };

  // Function to handle investment
  const handleInvestment = async (amount: number, currency: string) => {
    const newInvestment = {
      amount,
      currency,
      ideaId: selectedIdeaId,
      // Removed userAddress from the investment object
    };

    try {
      const response = await fetch('http://localhost:5000/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvestment),
      });

      if (!response.ok) {
        throw new Error('Failed to make investment');
      }

      alert(`Invested ${amount} ${currency} in idea ID: ${selectedIdeaId}`);
      setIsModalOpen(false); // Close the modal after investment
    } catch (error) {
      console.error('Error making investment:', error);
      alert('Investment failed: ' + error.message);
    }
  };

  // Filter ideas based on the search term
  const filteredIdeas = publicIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Explore Public Ideas</h1>
      <input
        type="text"
        placeholder="Search ideas by title..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Loading ideas...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : filteredIdeas.length === 0 ? (
        <p>No public ideas available that match your search.</p>
      ) : (
        <div className={styles.ideasContainer}>
          {filteredIdeas.map((item) => (
            <div key={item.id} className={styles.ideaBox}>
              <h3 className={styles.h3}>{item.title}</h3>
              <p>
                {expandedIds.includes(item.id) 
                  ? item.idea 
                  : item.idea.length > 100 
                    ? `${item.idea.slice(0, 100)}...` 
                    : item.idea}
              </p>
              <button onClick={() => toggleExpand(item.id)} className={styles.readMoreButton}>
                {expandedIds.includes(item.id) ? 'Read Less' : 'Read More'}
              </button>

              {/* Displaying both image and video if they exist */}
              {item.file && (
                <div className={styles.mediaContainer}>
                  {item.file.endsWith('.jpg') || item.file.endsWith('.png') ? (
                    <img src={item.file} alt="Uploaded File" className={styles.ideaImage} />
                  ) : (
                    item.file.endsWith('.mp4') && (
                      <video controls className={styles.ideaImage}>
                        <source src={item.file} type='video/mp4' />
                        Your browser does not support the video tag.
                      </video>
                    )
                  )}
                </div>
              )}
              <p>Uploaded by: {item.userAddress}</p>
              <button onClick={() => openInvestmentModal(item.id)} className={styles.investButton}>
                Invest
              </button>
            </div>
          ))}
        </div>
      )}
      
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvest={handleInvestment}
        ideaId={selectedIdeaId}
      />
    </div>
  );
};

export default ExplorePage;
