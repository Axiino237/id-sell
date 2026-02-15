export function getWhatsAppLink(phoneNumber: string, message: string) {
    const cleanNumber = phoneNumber.replace(/\D/g, ""); // Remove non-digits
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
}
