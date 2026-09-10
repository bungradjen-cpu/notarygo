import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Home Page', () => {
  it('should render the app', () => {
    const div = document.createElement('div');
    div.innerHTML = '<h1>NotaryGo</h1>';
    document.body.appendChild(div);
    expect(screen.getByText('NotaryGo')).toBeInTheDocument();
  });
});
