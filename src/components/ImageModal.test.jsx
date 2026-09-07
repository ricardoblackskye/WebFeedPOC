import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ImageModal from './ImageModal'

const images = ['https://example.com/a.jpg', 'https://example.com/b.jpg', 'https://example.com/c.jpg']

describe('ImageModal', () => {
  it('renders the current image by index', () => {
    const { container } = render(<ImageModal images={images} currentIndex={0} onClose={() => {}} onNavigate={() => {}} productName="Test" />)
    expect(container.querySelector('.image-modal-image').getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ImageModal images={images} currentIndex={0} onClose={onClose} onNavigate={() => {}} productName="Test" />)
    fireEvent.click(container.querySelector('.image-modal-close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onNavigate with next index', () => {
    const onNavigate = vi.fn()
    const { container } = render(<ImageModal images={images} currentIndex={0} onClose={() => {}} onNavigate={onNavigate} productName="Test" />)
    const nextButton = container.querySelectorAll('.image-modal-nav button')[1]
    fireEvent.click(nextButton)
    expect(onNavigate).toHaveBeenCalledWith(1)
  })

  it('calls onNavigate with prev index (wraps)', () => {
    const onNavigate = vi.fn()
    const { container } = render(<ImageModal images={images} currentIndex={0} onClose={() => {}} onNavigate={onNavigate} productName="Test" />)
    const prevButton = container.querySelectorAll('.image-modal-nav button')[0]
    fireEvent.click(prevButton)
    expect(onNavigate).toHaveBeenCalledWith(2)
  })
})
