import { useState, FormEvent, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Idea {
  id: string;
  title: string;
  idea: string;
  file?: string;
  userAddress?: string;
}

const UploadIdea = () => {
  const { address } = useAccount(); // Getting wallet address from wagmi
  const [idea, setIdea] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [ideasList, setIdeasList] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [expandedIdea, setExpandedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      if (!address) return;

      try {
        const response = await fetch(`http://localhost:5000/ideas/${address}`);
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
  }, [address]);

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

      if (!address) {
        throw new Error('You must connect to MetaMask first.');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('idea', idea);
      formData.append('userAddress', address);
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Upload Your Idea</h1>
      {address ? (
        <p className="text-lg mb-4">Connected Account: {address}</p>
      ) : (
        <p className="text-lg mb-4">Please connect your MetaMask wallet.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Idea Title"
          required
        />
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="Write your idea here..."
          required
        />
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          className={`w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Idea'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {success && <p className="mt-4 text-green-600">Idea Uploaded successfully!</p>}

      <h2 className="text-2xl font-semibold mt-8 mb-4">Your Uploaded Ideas:</h2>
      <div className="flex items-center space-x-2 mb-6">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
          onClick={scrollLeft}
        >
          ←
        </button>
        <div
          className="flex overflow-x-auto space-x-4"
          id="ideasContainer"
        >
          {ideasList.length === 0 ? (
            <p className="text-lg text-gray-500">No ideas uploaded yet.</p>
          ) : (
            ideasList.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-64 p-4 border border-gray-300 rounded-lg space-y-2">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p>{item.idea.length > 100 ? item.idea.slice(0, 100) + '...' : item.idea}</p>
                  <button
                    onClick={() => handleReadMore(item)}
                    className="text-indigo-600 hover:underline"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400"
          onClick={scrollRight}
        >
          →
        </button>
      </div>

      {/* Modal for expanded idea */}
      {expandedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full space-y-4">
            <h2 className="text-2xl font-semibold">{expandedIdea.title}</h2>
            <p>{expandedIdea.idea}</p>
            {expandedIdea.file && (
              <div>
                <h4 className="font-semibold">Attached File:</h4>
                <a
                  href={expandedIdea.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  View File
                </a>
              </div>
            )}
            <button
              onClick={closeExpandedIdea}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadIdea;