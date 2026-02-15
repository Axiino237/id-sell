"use client";

import { useEffect } from "react";

export default function DeleteConfirmForm({
    action,
    productId,
    children
}: {
    action: (formData: FormData) => void;
    productId: string;
    children: React.ReactNode;
}) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            e.preventDefault();
        }
    };

    return (
        <form action={action} onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={productId} />
            {children}
        </form>
    );
}
