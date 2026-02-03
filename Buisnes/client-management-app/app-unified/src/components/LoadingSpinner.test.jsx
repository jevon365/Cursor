import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with loading accessibility attributes', () => {
    render(<LoadingSpinner />);
    const status = document.querySelector('[role="status"]');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Loading');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies size class for md by default', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('applies size class for lg when specified', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('applies size class for sm when specified', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });
});
