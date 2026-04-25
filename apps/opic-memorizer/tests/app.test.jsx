import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App.jsx';

describe('OPIc Memorizer app', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders topic navigation and reveals English from a Korean flow sentence', () => {
    render(<App />);

    expect(screen.getByText('OPIc Memorizer')).toBeInTheDocument();
    fireEvent.click(screen.getByText('안녕하세요. 저는 김민수라고 합니다.'));

    expect(screen.getByText('Hi, my name is Minsoo Kim.')).toBeInTheDocument();
  });

  it('rates a drill card and persists progress to localStorage', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /1:1 Drill/ }));
    fireEvent.click(screen.getByRole('button', { name: /Reveal English/ }));
    fireEvent.click(screen.getByRole('button', { name: /Mastered/ }));

    expect(window.localStorage.getItem('opic-memorizer:progress:2026-04-22')).toContain('mastered');
  });

  it('keeps order quiz unavailable for scripts that need line review', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Movies/ }));
    fireEvent.click(screen.getByText('Past vs Present'));
    fireEvent.click(screen.getByRole('button', { name: /Order Quiz/ }));

    expect(screen.getByText(/line alignment needs review/i)).toBeInTheDocument();
  });
});
