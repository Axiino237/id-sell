"use client";

import React from "react";

interface AdminActionFormProps {
    action: (formData: FormData) => void;
    confirmMessage: string;
    children: React.ReactNode;
    hiddenInputs?: Record<string, string>;
}

export default function AdminActionForm({
    action,
    confirmMessage,
    children,
    hiddenInputs = {}
}: AdminActionFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!confirm(confirmMessage)) {
            e.preventDefault();
        }
    };

    return (
        <form action={action} onSubmit={handleSubmit} className="inline-block">
            {Object.entries(hiddenInputs).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}
            {children}
        </form>
    );
}
