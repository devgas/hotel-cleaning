import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/common/StatusBadge'

describe('StatusBadge', () => {
  it('shows cleaned status with green style', () => {
    render(<StatusBadge status="cleaned" label="Прибрано" />)
    const el = screen.getByText('Прибрано')
    expect(el.className).toContain('green')
  })

  it('shows not_cleaned_yet with amber style', () => {
    render(<StatusBadge status="not_cleaned_yet" label="Не прибрано" />)
    const el = screen.getByText('Не прибрано')
    expect(el.className).toContain('amber')
  })

  it('shows not_needed with gray style', () => {
    render(<StatusBadge status="not_needed" label="Не потрібно" />)
    const el = screen.getByText('Не потрібно')
    expect(el.className).toContain('gray')
  })
})
