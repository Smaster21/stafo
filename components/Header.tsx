// Header.tsx

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Container } from '@/components/Container'

export function Header() {
  return (
    <header className="header">
      <Container>
        <nav className="nav">
          <div className='controls-container'>
            <div className='connect-button'>
              <ConnectButton />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}
