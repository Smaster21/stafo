import { useEffect, useState } from "react";
import { useAccount } from "wagmi"; // Importing useAccount to manage wallet connection
import InvestmentModal from "../pages/investment";

interface Idea {
  id: string;
  title: string;
  idea: string;
  file?: string; // Assuming 'file' can be an image or a video URL
  userAddress?: string;
}

export default function Home() {
  const { isConnected } = useAccount(); // Get wallet connection status
  const [publicIdeas, setPublicIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]); // State to track expanded ideas
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search input
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for modal visibility
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(""); // State to hold selected idea id

  useEffect(() => {
    const fetchPublicIdeas = async () => {
      try {
        const response = await fetch("http://localhost:5000/ideas"); // Ensure the API is running
        if (!response.ok) {
          throw new Error("Failed to fetch public ideas");
        }
        const data = await response.json();
        setPublicIdeas(
          data.map((item: any) => ({
            id: item._id,
            title: item.title,
            idea: item.idea,
            file: item.file,
            userAddress: item.userAddress,
          }))
        );
      } catch (error) {
        console.error("Error fetching public ideas:", error);
        setError("Failed to fetch public ideas");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicIdeas();
  }, []);

  // Function to toggle expanded state
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((expandedId) => expandedId !== id)
        : [...prev, id]
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
    };

    try {
      const response = await fetch("http://localhost:5000/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvestment),
      });

      if (!response.ok) {
        throw new Error("Failed to make investment");
      }

      alert(`Invested ${amount} ${currency} in idea ID: ${selectedIdeaId}`);
      setIsModalOpen(false); // Close the modal after investment
    } catch (error: any) {
      console.error("Error making investment:", error);
      alert("Investment failed: " + error.message);
    }
  };

  // Filter ideas based on the search term
  const filteredIdeas = publicIdeas.filter((idea) =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Explore Public Ideas
      </h1>

      <div className="mb-6 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Search ideas by title..."
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading ideas...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredIdeas.length === 0 ? (
        <p className="text-center text-gray-500">
          No public ideas available that match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {expandedIds.includes(item.id)
                  ? item.idea
                  : item.idea.length > 100
                  ? `${item.idea.slice(0, 100)}...`
                  : item.idea}
              </p>
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-blue-500 text-sm hover:underline"
              >
                {expandedIds.includes(item.id) ? "Read Less" : "Read More"}
              </button>

              {/* Displaying both image and video if they exist */}
              {item.file && (
                <div className="my-4">
                  {item.file.endsWith(".jpg") || item.file.endsWith(".png") ? (
                    <img
                      src={item.file}
                      alt="Uploaded File"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    item.file.endsWith(".mp4") && (
                      <video controls className="w-full rounded-lg">
                        <source src={item.file} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )
                  )}
                </div>
              )}
              <p className="text-gray-500 text-sm">
                Uploaded by: <span className="font-medium">{item.userAddress}</span>
              </p>
              {/* Only show the "Invest" button if the user is connected */}
              {isConnected ? (
                <button
                  onClick={() => openInvestmentModal(item.id)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                >
                  Invest
                </button>
              ) : (
                <p className="mt-4 text-red-500 text-sm">Please connect your wallet to invest.</p>
              )}
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
}
