export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    images: string[];
    created_at: string;
    is_promoted?: boolean;
    seller_id: string;
    users?: {
        name: string;
        whatsapp_number: string;
    };
    categories?: {
        id: string;
        name: string;
        slug: string;
    };
}
