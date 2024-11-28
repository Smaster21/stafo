// components/Navbar.tsx

import Link from 'next/link';
import { Header } from '@/components/Header';
import styles from '../styles/navbar.module.css';

const Navbar: React.FC = () => {
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navbarLinks}>
            
                <li>
                    <Link href="/explore">Explore</Link> {/* Ensure this matches the filename in the pages folder */}
                </li>
                <li>
                    <Link href="/uplode-idea">Upload Idea</Link>
                </li>
                <li>
                    <Link href="/investo">Investment</Link> {/* Ensure this matches the filename in the pages folder */}
                </li>
                <li>
                    <Link href="/fund">Funds</Link> {/* Ensure this matches the filename in the pages folder */}
                </li>
            </ul>
            <div className={styles.headerContainer}>
                <Header />
            </div>
        </nav>
    );
};

export default Navbar;
