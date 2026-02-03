import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder and aria-label', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search projects..." />);
    const input = screen.getByLabelText('Search projects...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search projects...');
  });

  it('displays value', () => {
    render(<SearchInput value="hello" onChange={() => {}} />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('calls onChange with new value when user types', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Search" />);
    const input = screen.getByLabelText('Search');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('uses default placeholder when not provided', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
