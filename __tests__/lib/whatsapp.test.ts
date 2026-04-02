import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink } from '@/lib/whatsapp/buildLink'

describe('buildWhatsAppLink', () => {
  it('builds a valid wa.me link', () => {
    const link = buildWhatsAppLink('+380991234567', 'Кімната {room} прибрана', '101')
    expect(link).toContain('wa.me/380991234567')
    expect(link).toContain(encodeURIComponent('Кімната 101 прибрана'))
  })

  it('strips leading + from phone', () => {
    const link = buildWhatsAppLink('+1234567890', 'Room {room}', '202')
    expect(link).toContain('wa.me/1234567890')
    expect(link).not.toContain('wa.me/+')
  })

  it('injects room number into template', () => {
    const link = buildWhatsAppLink('1234567890', 'Room {room} done', '303')
    expect(link).toContain(encodeURIComponent('Room 303 done'))
  })
})
