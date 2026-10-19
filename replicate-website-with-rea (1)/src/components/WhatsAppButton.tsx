"use client";

import { waLink } from "@/lib/whatsapp";

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 7.6c-.3.4-.8 1-.7 1.9.2 1.3 1.1 2.7 2.4 3.9 1.3 1.2 2.7 1.9 3.9 2 1 .1 1.7-.4 2-.9.2-.4.1-.6-.1-.7l-1.6-.8c-.3-.1-.5 0-.7.2l-.5.6c-.2.2-.4.2-.6.1-.9-.4-1.8-1.1-2.4-2.1-.1-.2-.1-.4 0-.6l.4-.6c.1-.2.1-.4 0-.6l-.7-1.6c-.1-.3-.3-.4-.6-.4h-.4c-.2 0-.4 0-.6.2z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Opens the store owner's WhatsApp with a ready-to-send order message. */
export default function WhatsAppButton({
  message,
  label,
  className = "btn-wa",
  disabled,
}: {
  message: () => string;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={() => window.open(waLink(message()), "_blank", "noopener,noreferrer")}
    >
      <WhatsAppIcon />
      {label}
    </button>
  );
}
