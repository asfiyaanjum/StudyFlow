import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders progressbar with correct accessibility attributes', () => {
    render(<ProgressBar value={65} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '65');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps values below 0 and above 100', () => {
    const { rerender } = render(<ProgressBar value={-20} />);
    let bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressBar value={140} />);
    bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('displays label and percentage when requested', () => {
    render(<ProgressBar value={75} label="Physics Syllabus" showPercentage />);
    expect(screen.getByText('Physics Syllabus')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
