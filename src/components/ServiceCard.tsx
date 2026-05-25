"use client";

import { useState } from "react";
import { Service, CATEGORY_COLORS } from "@/src/types/service";

interface ServiceCardProps {
    service: Service;
    onEdit: (service: Service) => void;
    onDelete: (id: string) => void;
    index?: number;
}

export default function ServiceCard({
    service,
    onEdit,
    onDelete,
    index = 0,
}: ServiceCardProps) {
    const [hovered, setHovered] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const accentColor =
        service.color ||
        (service.category
            ? CATEGORY_COLORS[service.category as keyof typeof CATEGORY_COLORS]
            : "#e8547a") ||
        "#e8547a";

    const handleOpen = () => {
        let url = service.url;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const getFavicon = () => {
        try {
            const u = new URL(
                /^https?:\/\//i.test(service.url)
                    ? service.url
                    : `https://${service.url}`,
            );
            return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
        } catch {
            return null;
        }
    };

    const favicon = getFavicon();

    const delayClass = [
        "stagger-1",
        "stagger-2",
        "stagger-3",
        "stagger-4",
        "stagger-5",
        "stagger-6",
    ][Math.min(index, 5)];

    return (
        <div
            className={`animate-fade-in-up ${delayClass}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                setConfirmDelete(false);
            }}
            style={{
                background: "var(--bg-card)",
                border: `1px solid ${hovered ? accentColor + "60" : "var(--border-subtle)"}`,
                borderRadius: "16px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered
                    ? `0 0 0 1px ${accentColor}25, 0 20px 40px ${accentColor}15`
                    : "none",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ambient glow top-right */}
            <div
                style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
                    transition: "opacity 0.3s ease",
                    opacity: hovered ? 1 : 0,
                    pointerEvents: "none",
                }}
            />

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    marginBottom: "14px",
                }}
            >
                {/* Icon / Image */}
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: service.imageUrl
                            ? "transparent"
                            : `${accentColor}20`,
                        border: `1px solid ${accentColor}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    {service.imageUrl ? (
                        <img
                            src={service.imageUrl}
                            alt={service.name}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                    "none";
                            }}
                        />
                    ) : favicon ? (
                        <img
                            src={favicon}
                            alt=""
                            style={{ width: "28px", height: "28px" }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                    "none";
                            }}
                        />
                    ) : (
                        <span
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "18px",
                                color: accentColor,
                            }}
                        >
                            {service.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Name + URL */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "15px",
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {service.name}
                    </h3>
                    <p
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {service.url}
                    </p>
                </div>

                {/* Category dot */}
                {service.category && (
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: accentColor,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${accentColor}80`,
                            marginTop: "4px",
                        }}
                    />
                )}
            </div>

            {/* Description */}
            {service.description && (
                <p
                    style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.6",
                        marginBottom: "16px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {service.description}
                </p>
            )}

            {/* Category badge */}
            {service.category && (
                <div style={{ marginBottom: "14px" }}>
                    <span
                        style={{
                            background: `${accentColor}15`,
                            color: accentColor,
                            border: `1px solid ${accentColor}30`,
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-display)",
                            padding: "3px 10px",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        {service.category}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(6px)",
                    transition: "all 0.2s ease",
                }}
            >
                {/* Open */}
                <a
                    href={
                        /^https?:\/\//i.test(service.url)
                            ? service.url
                            : `https://${service.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Évite de déclencher un éventuel clic sur la carte
                    style={{
                        flex: 1,
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        textDecoration: "none", // Requis pour enlever le soulignement du lien
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M2 10L10 2M10 2H5M10 2V7"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Ouvrir
                </a>

                {/* Edit */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(service);
                    }}
                    style={{
                        width: "34px",
                        height: "34px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        (
                            e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#e8547a";
                        (
                            e.currentTarget as HTMLButtonElement
                        ).style.background = "#e8547a15";
                    }}
                    onMouseLeave={(e) => {
                        (
                            e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "var(--border-subtle)";
                        (
                            e.currentTarget as HTMLButtonElement
                        ).style.background = "var(--bg-elevated)";
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path
                            d="M9.5 1.5L11.5 3.5L4 11H2V9L9.5 1.5Z"
                            stroke="#a89ba0"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Delete */}
                {confirmDelete ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(service.id);
                        }}
                        style={{
                            width: "34px",
                            height: "34px",
                            background: "#ef444415",
                            border: "1px solid #ef4444",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                        >
                            <path
                                d="M1.5 3.5H11.5M4.5 3.5V2H8.5V3.5M5.5 6V10M7.5 6V10M3 3.5L3.5 11H9.5L10 3.5"
                                stroke="#ef4444"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(true);
                        }}
                        style={{
                            width: "34px",
                            height: "34px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "#ef4444";
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.background = "#ef444415";
                        }}
                        onMouseLeave={(e) => {
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "var(--border-subtle)";
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.background = "var(--bg-elevated)";
                        }}
                    >
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                        >
                            <path
                                d="M1.5 3.5H11.5M4.5 3.5V2H8.5V3.5M5.5 6V10M7.5 6V10M3 3.5L3.5 11H9.5L10 3.5"
                                stroke="#a89ba0"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
