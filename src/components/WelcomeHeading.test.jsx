import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WelcomeHeading from './WelcomeHeading'

describe('WelcomeHeading', () => {
  it("renders a level-2 heading with the exact text 'Welcome to the site'", () => {
    render(<WelcomeHeading />)
    expect(screen.getByRole('heading', { level: 2, name: 'Welcome to the site' })).toBeInTheDocument()
  })

  it('renders the sub-heading in bold', () => {
    render(<WelcomeHeading />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveStyle({ fontWeight: 'bold' })
  })
})
