import { describe, it, expect } from 'vitest'
import { buildWhatsAppAppLink, buildWhatsAppLink, normalizeWhatsAppChatLink } from '@/lib/whatsapp/buildLink'

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

  it('builds a valid app link', () => {
    const link = buildWhatsAppAppLink('+1234567890', 'Room {room} done', '303')
    expect(link).toContain('whatsapp://send?phone=1234567890')
    expect(link).toContain(encodeURIComponent('Room 303 done'))
  })

  it('keeps a whatsapp chat invite link intact', () => {
    const link = normalizeWhatsAppChatLink(' https://chat.whatsapp.com/EgpjGRY914PLu6ItPU0K5V?mode=gi_t ')
    expect(link).toBe('https://chat.whatsapp.com/EgpjGRY914PLu6ItPU0K5V?mode=gi_t')
  })
})
