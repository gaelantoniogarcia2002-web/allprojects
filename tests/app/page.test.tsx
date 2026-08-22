import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home page', () => {
  it('renders the app heading', () => {
    render(<Home />)

    expect(
      screen.getByRole('heading', { name: 'Base de Datos Visual de Proyectos' }),
    ).toBeInTheDocument()
  })
})
