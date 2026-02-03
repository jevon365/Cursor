import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('returns null when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when message is not provided', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders message when provided', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has error styling', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    const wrapper = container.querySelector('.bg-red-50');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('border-red-200', 'text-red-700');
  });
});
