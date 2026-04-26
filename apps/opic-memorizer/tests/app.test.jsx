import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';

describe('OPIc Memorizer app', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders topic navigation and reveals English from a Korean flow sentence', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { name: 'OPIc Memorizer' })[0]).toBeInTheDocument();
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

  it('enables order quiz for aligned scripts', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Movies/ }));
    fireEvent.click(within(screen.getByLabelText('Question list')).getByRole('button', { name: /Past vs Present/ }));
    fireEvent.click(screen.getByRole('button', { name: /Order Quiz/ }));

    expect(screen.getByText(/Shuffled Korean lines/i)).toBeInTheDocument();
    expect(screen.getByText(/Your answer flow/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check Order/ })).toBeInTheDocument();
  });

  it('switches topic and question from the mobile controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^Topic$/ }));
    await user.selectOptions(screen.getByLabelText('Mobile topic selector'), '04-movies-performances-concerts');

    const rail = screen.getByLabelText('Mobile question rail');
    await user.click(within(rail).getByRole('button', { name: /Past vs Present/ }));

    expect(screen.getByRole('heading', { name: /Past vs Present/i })).toBeInTheDocument();
  });

  it('toggles drill order between default and random sequences', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /1:1 Drill/ }));

    expect(screen.getByText('안녕하세요. 저는 김민수라고 합니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /랜덤 순서/ }));

    expect(screen.getByText('저는 수원 광교 아파트에서 아내와 6살 딸과 함께 살고 있습니다.')).toBeInTheDocument();
    expect(screen.queryByText('안녕하세요. 저는 김민수라고 합니다.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /기본 순서/ }));

    expect(screen.getByText('안녕하세요. 저는 김민수라고 합니다.')).toBeInTheDocument();
  });
});
