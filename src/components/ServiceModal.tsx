"use client";

import { useState, useEffect, useRef } from "react";
import {
    Service,
    SERVICE_CATEGORIES,
    CATEGORY_COLORS,
} from "@/src/types/service";

interface ServiceModalProps {
    service?: Service | null;
    onSave: (data: Omit<Service, "id" | "createdAt" | "updatedAt">) => void;
    onClose: () => void;
}

const ACCENT_COLORS = [
    "#e8547a",
    "#f9a8c0",
    "#c23a5e",
    "#4ade80",
    "#60a5fa",
    "#a78bfa",
    "#fb923c",
    "#fbbf24",
    "#94a3b8",
];

export default function ServiceModal({
    service,
    onSave,
    onClose,
}: ServiceModalProps) {
    const [name, setName] = useState(service?.name ?? "");
    const [url, setUrl] = useState(service?.url ?? "");
    const [description, setDescription] = useState(service?.description ?? "");
    const [imageUrl, setImageUrl] = useState(service?.imageUrl ?? "");
    const [category, setCategory] = useState(service?.category ?? "");
    const [color, setColor] = useState(service?.color ?? "#e8547a");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        nameRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Le nom est requis";
        if (!url.trim()) errs.url = "L'URL est requise";
        else {
            try {
                new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
            } catch {
                errs.url = "URL invalide";
            }
        }
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 300));
        onSave({
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            imageUrl: imageUrl.trim(),
            category: category || undefined,
            color,
        });
        setSaving(false);
    };

    const isEdit = !!service;

    return (
        <div
            className="modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="animate-scale-in"
                style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "20px",
                    padding: "28px",
                    width: "100%",
                    maxWidth: "480px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow:
                        "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px #e8547a20",
                    position: "relative",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "24px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: "20px",
                                color: "var(--text-primary)",
                                lineHeight: 1.2,
                            }}
                        >
                            {isEdit
                                ? "Modifier le service"
                                : "Ajouter un service"}
                        </h2>
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "13px",
                                color: "var(--text-muted)",
                                marginTop: "4px",
                            }}
                        >
                            {isEdit
                                ? "Mettez à jour les informations"
                                : "Renseignez les informations du service"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "#e8547a";
                        }}
                        onMouseLeave={(e) => {
                            (
                                e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "var(--border-subtle)";
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M1 1L11 11M11 1L1 11"
                                stroke="#a89ba0"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Fields */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    {/* Name */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Nom *
                        </label>
                        <input
                            ref={nameRef}
                            className="input-base"
                            type="text"
                            placeholder="Ex: GitHub, Figma, Notion..."
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((p) => ({ ...p, name: "" }));
                            }}
                        />
                        {errors.name && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    marginTop: "4px",
                                }}
                            >
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* URL */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            URL *
                        </label>
                        <input
                            className="input-base"
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setErrors((p) => ({ ...p, url: "" }));
                            }}
                        />
                        {errors.url && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "12px",
                                    marginTop: "4px",
                                }}
                            >
                                {errors.url}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Description
                        </label>
                        <textarea
                            className="input-base"
                            placeholder="Courte description du service..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            style={{ resize: "vertical", minHeight: "80px" }}
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Image (URL)
                        </label>
                        <input
                            className="input-base"
                            type="url"
                            placeholder="https://example.com/logo.png"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        {imageUrl && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt="preview"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                        border: "1px solid var(--border-subtle)",
                                    }}
                                    onError={(e) => {
                                        (
                                            e.target as HTMLImageElement
                                        ).style.display = "none";
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Aperçu
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "6px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Catégorie
                        </label>
                        <select
                            className="input-base"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (
                                    e.target.value &&
                                    CATEGORY_COLORS[
                                        e.target
                                            .value as keyof typeof CATEGORY_COLORS
                                    ]
                                ) {
                                    setColor(
                                        CATEGORY_COLORS[
                                            e.target
                                                .value as keyof typeof CATEGORY_COLORS
                                        ],
                                    );
                                }
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <option value="">Aucune catégorie</option>
                            {SERVICE_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Color */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Couleur accent
                        </label>
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                            }}
                        >
                            {ACCENT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "8px",
                                        background: c,
                                        border:
                                            color === c
                                                ? `2px solid white`
                                                : "2px solid transparent",
                                        cursor: "pointer",
                                        boxShadow:
                                            color === c
                                                ? `0 0 10px ${c}80`
                                                : "none",
                                        transition: "all 0.15s ease",
                                        transform:
                                            color === c
                                                ? "scale(1.15)"
                                                : "scale(1)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{ display: "flex", gap: "10px", marginTop: "24px" }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                            borderRadius: "10px",
                            padding: "11px",
                            fontSize: "14px",
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                            flex: 2,
                            background: saving
                                ? "var(--bg-elevated)"
                                : "linear-gradient(135deg, #e8547a, #c23a5e)",
                            border: "none",
                            color: "#fff",
                            borderRadius: "10px",
                            padding: "11px",
                            fontSize: "14px",
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            cursor: saving ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: saving ? "none" : "0 0 20px #e8547a30",
                        }}
                    >
                        {saving ? (
                            <>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    style={{
                                        animation: "spin 1s linear infinite",
                                    }}
                                >
                                    <circle
                                        cx="7"
                                        cy="7"
                                        r="5"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeDasharray="20"
                                        strokeDashoffset="10"
                                    />
                                </svg>
                                Enregistrement...
                            </>
                        ) : isEdit ? (
                            "Sauvegarder"
                        ) : (
                            "Ajouter le service"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
