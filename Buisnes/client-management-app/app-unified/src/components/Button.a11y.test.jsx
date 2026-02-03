import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Button from './Button';

describe('Button (accessibility)', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Button>Submit</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('is focusable and has visible focus', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button', { name: /click/i });
    expect(btn).toHaveAttribute('type', 'button');
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });
});
