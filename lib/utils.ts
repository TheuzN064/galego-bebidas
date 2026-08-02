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

  const total = Math.max(0, order.subtotal + order.deliveryFee - (order.discount || 0))
  const discountText = order.discount > 0 ? `\n🎟️ *Desconto:* -${formatCurrency(order.discount)}` : ''
  const couponText = order.couponCode ? `\n🏷️ *Cupom Aplicado:* ${order.couponCode}` : ''

  // Format full address
  let addressText = ''
  if (typeof order.customer.address === 'string' && order.customer.address && !order.customer.street) {
    addressText = order.customer.address
  } else {
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

  const changeText = order.changeFor ? ` (Troco para ${formatCurrency(Number(order.changeFor) || 0)})` : ''

  return `🍺 *NOVO PEDIDO - GALEGO BEBIDAS* 🍺
━━━━━━━━━━━━━━━━━━━━

👤 *DADOS DO CLIENTE:*
▪ *Nome:* ${order.customer.name}
▪ *WhatsApp:* ${order.customer.phone}

📍 *ENDEREÇO DE ENTREGA:*
${addressText ? addressText : 'Não informado'}

━━━━━━━━━━━━━━━━━━━━
🛒 *ITENS DO PEDIDO:*
${items}

━━━━━━━━━━━━━━━━━━━━
${couponText}💰 *Subtotal:* ${formatCurrency(order.subtotal)}
🛵 *Taxa de entrega:* ${formatCurrency(order.deliveryFee)}${discountText}
🔥 *TOTAL DO PEDIDO:* ${formatCurrency(total)}

💳 *Forma de pagamento:* ${order.paymentMethod}${changeText}
📝 *Observações:* ${order.notes || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━━━
⚡ _Pedido enviado via Catálogo Online Galego_`
}
