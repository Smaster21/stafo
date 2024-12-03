// components/Navbar.tsx

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 flex justify-between items-center p-6 bg-gray-900 text-white">
      {/* Left side links */}
      <div className="flex space-x-6">
        <div>
          <Link href="/" className="text-lg hover:text-gray-400">
            Explore
          </Link>
        </div>
        <div>
          <Link href="/create" className="text-lg hover:text-gray-400">
            Create Idea
          </Link>
        </div>
        <div>
          <Link href="/investor" className="text-lg hover:text-gray-400">
            My Investment
          </Link>
        </div>
        <div>
          <Link href="/fund" className="text-lg hover:text-gray-400">
            Funds Raised
          </Link>
        </div>
      </div>
      
      {/* Right side connect button */}
      <div>
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;