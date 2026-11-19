import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
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

  it('closes the modal when the modal image is clicked again', () => {
    const onClose = vi.fn()
    const { container } = render(<ImageModal images={images} currentIndex={0} onClose={onClose} onNavigate={() => {}} productName='Test' />)
    fireEvent.click(container.querySelector('.image-modal-image'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders the modal image at its natural size without forced width/height', () => {
    render(<ImageModal images={images} currentIndex={1} onClose={() => {}} onNavigate={() => {}} productName='Test' />)
    const dialog = screen.getByRole('dialog')
    const img = dialog.querySelector('.image-modal-image')
    expect(img.getAttribute('src')).toBe(images[1])
    expect(img.hasAttribute('width')).toBe(false)
    expect(img.hasAttribute('height')).toBe(false)
    expect(img.getAttribute('style')).toBeNull()
    expect(img.closest('.image-modal-content')).not.toBeNull()
    expect(dialog.querySelector('.image-modal-backdrop')).toBeNull()
  })
})
