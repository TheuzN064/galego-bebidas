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

export function formatWhatsAppMessage(order: any, config: any): string {
  const items = order.items.map((item: any) => {
    const product = item.product || item
    const name = product.name || item.name
    const unitPrice = (product.promotional && product.promotionalPrice)
      ? product.promotionalPrice
      : (product.price || item.price)
    return `${item.quantity}x ${name} - ${formatCurrency(unitPrice * item.quantity)}`
  }).join('\n')

  const total = order.subtotal + order.deliveryFee - order.discount
  const discountText = order.discount > 0 ? `\n*Desconto: ${formatCurrency(order.discount)}*` : ''
  const couponText = order.couponCode ? `\n*Cupom: ${order.couponCode}*` : ''

  return `🛒 *Novo Pedido - Galego Bebidas*

*Cliente:* ${order.customer.name}
*Telefone:* ${order.customer.phone}
*Endereço:* ${order.customer.address}

📦 *Itens:*
${items}

${couponText}
*Subtotal:* ${formatCurrency(order.subtotal)}
*Taxa de entrega:* ${formatCurrency(order.deliveryFee)}${discountText}
*TOTAL:* ${formatCurrency(total)}

*Forma de pagamento:* ${order.paymentMethod}
*Observações:* ${order.notes || 'Nenhuma'}`
}
