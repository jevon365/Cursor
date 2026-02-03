import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import SearchInput from './SearchInput';

describe('SearchInput (accessibility)', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <SearchInput value="" onChange={() => {}} placeholder="Search..." />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('associates label with input via aria-label', () => {
    const { getByLabelText } = render(
      <SearchInput value="" onChange={() => {}} placeholder="Search projects" />
    );
    expect(getByLabelText('Search projects')).toBeInTheDocument();
  });
});
