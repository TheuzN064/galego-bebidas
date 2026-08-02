import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatWhatsAppMessage(order: any, config?: any): string {
  const items = order.items.map((item: any) => {
    const product = item.product || item
    const name = product.name || item.name
    const unitPrice = (product.promotional && product.promotionalPrice)
      ? product.promotionalPrice
      : (product.price || item.price)
    return `▪ ${item.quantity}x ${name} - ${formatCurrency(unitPrice * item.quantity)}`
  }).join('\n')

  const isPickup = order.deliveryType === 'pickup'
  const deliveryFee = isPickup ? 0 : (order.deliveryFee || 0)
  const total = Math.max(0, order.subtotal + deliveryFee - (order.discount || 0))
  const discountText = order.discount > 0 ? `\n🎟️ *Desconto:* -${formatCurrency(order.discount)}` : ''
  const couponText = order.couponCode ? `\n🏷️ *Cupom Aplicado:* ${order.couponCode}` : ''

  // Format delivery/pickup section
  let deliverySection = ''
  if (isPickup) {
    deliverySection = `🏬 *TIPO DE PEDIDO:* RETIRADA NA LOJA
📍 *Local de Retirada:* ${config?.address || 'Depósito Galego Bebidas'}
${config?.hours ? `🕒 *Horário:* ${config.hours}` : ''}`
  } else {
    let addressText = ''
    if (typeof order.customer?.address === 'string' && order.customer.address && !order.customer.street) {
      addressText = order.customer.address
    } else if (order.customer) {
      const lines: string[] = []
      if (order.customer.street) {
        lines.push(`${order.customer.street}, Nº ${order.customer.number || 'S/N'}`)
      }
      if (order.customer.complement) {
        lines.push(`Complemento: ${order.customer.complement}`)
      }
      if (order.customer.neighborhood) {
        lines.push(`Bairro: ${order.customer.neighborhood}`)
      }
      if (order.customer.city) {
        lines.push(`Cidade: ${order.customer.city}`)
      }
      if (order.customer.reference) {
        lines.push(`Ponto de Ref.: ${order.customer.reference}`)
      }
      if (order.customer.cep) {
        lines.push(`CEP: ${order.customer.cep}`)
      }
      addressText = lines.join('\n')
    }

    deliverySection = `🛵 *TIPO DE PEDIDO:* ENTREGA DELIVERY
📍 *ENDEREÇO DE ENTREGA:*
${addressText || 'Não informado'}`
  }

  const changeText = order.changeFor ? ` (Troco para ${formatCurrency(Number(order.changeFor) || 0)})` : ''
  const feeLine = isPickup 
    ? `🏬 *Entrega:* Grátis (Retirada no Local)` 
    : `🛵 *Taxa de entrega:* ${formatCurrency(deliveryFee)}`

  return `🍺 *NOVO PEDIDO - GALEGO BEBIDAS* 🍺
━━━━━━━━━━━━━━━━━━━━

${deliverySection}

👤 *DADOS DO CLIENTE:*
▪ *Nome:* ${order.customer?.name || 'Cliente'}
▪ *WhatsApp:* ${order.customer?.phone || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━
🛒 *ITENS DO PEDIDO:*
${items}

━━━━━━━━━━━━━━━━━━━━
${couponText}💰 *Subtotal:* ${formatCurrency(order.subtotal)}
${feeLine}${discountText}
🔥 *TOTAL DO PEDIDO:* ${formatCurrency(total)}

💳 *Forma de pagamento:* ${order.paymentMethod}${changeText}
📝 *Observações:* ${order.notes || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━━━
⚡ _Pedido enviado via Catálogo Online Galego_`
}

/**
 * Formats a Brazilian or international phone number for WhatsApp API
 * Ensures country code (55 for BR) is present if phone has standard 10 or 11 digits
 */
export function formatWhatsAppPhone(phone: string): string {
  const clean = (phone || '').replace(/\D/g, '')
  if (!clean) return ''
  
  // Standard Brazilian phone with DDD (10 or 11 digits)
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`
  }
  
  return clean
}

/**
 * Creates a valid https://wa.me/ URL with normalized phone and encoded message
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = formatWhatsAppPhone(phone)
  if (!cleanPhone) return '#'
  
  if (!message) {
    return `https://wa.me/${cleanPhone}`
  }
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
