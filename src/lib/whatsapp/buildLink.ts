export function buildWhatsAppLink(phone: string, template: string, roomNumber: string): string {
  const cleanPhone = phone.replace(/^\+/, '')
  const message = template.replace('{room}', roomNumber)
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppAppLink(phone: string, template: string, roomNumber: string): string {
  const cleanPhone = phone.replace(/^\+/, '')
  const message = template.replace('{room}', roomNumber)
  return `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
}
