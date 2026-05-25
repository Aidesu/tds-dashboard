"use client";

import { useState, useEffect, useCallback } from "react";
import ServiceCard from "@/src/components/ServiceCard";
import ServiceModal from "@/src/components/ServiceModal";
import { Service, SERVICE_CATEGORIES } from "@/src/types/service";
import {
    getServices,
    addService,
    updateService,
    deleteService,
} from "@/src/lib/services";

export default function HomePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setServices(getServices());
        setMounted(true);
    }, []);

    // Listen for header "+" button
    useEffect(() => {
        const handler = () => {
            setEditingService(null);
            setModalOpen(true);
        };
        window.addEventListener("open-add-service", handler);
        return () => window.removeEventListener("open-add-service", handler);
    }, []);

    const handleSave = useCallback(
        (data: Omit<Service, "id" | "createdAt" | "updatedAt">) => {
            if (editingService) {
                updateService(editingService.id, data);
            } else {
                addService(data);
            }
            setServices(getServices());
            setModalOpen(false);
            setEditingService(null);
        },
        [editingService],
    );

    const handleEdit = useCallback((service: Service) => {
        setEditingService(service);
        setModalOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        deleteService(id);
        setServices(getServices());
    }, []);

    const filtered = services.filter((s) => {
        const matchSearch =
            !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.url.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCategory || s.category === filterCategory;
        return matchSearch && matchCat;
    });

    if (!mounted) return null;

    return (
        <div
            style={{
                minHeight: "100vh",
                paddingTop: "80px",
                paddingBottom: "60px",
                position: "relative",
                zIndex: 1,
            }}
        >
            <div
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 24px",
                }}
            >
                {/* ── Hero ── */}
                <div
                    className="animate-fade-in-up"
                    style={{ paddingTop: "48px", paddingBottom: "40px" }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                        }}
                    >
                        <span className="badge">Dashboard</span>
                        <span
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "13px",
                                color: "var(--text-muted)",
                            }}
                        >
                            {services.length} service
                            {services.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <h1
                        style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "clamp(36px, 5vw, 56px)",
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            color: "var(--text-primary)",
                            marginBottom: "16px",
                        }}
                    >
                        Mes services,
                        <br />
                        <span className="text-gradient">au même endroit.</span>
                    </h1>
                    <p
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "16px",
                            color: "var(--text-secondary)",
                            maxWidth: "480px",
                            lineHeight: 1.7,
                        }}
                    >
                        Centralisez tous vos outils et sites en un dashboard
                        personnel. Accès rapide, organisation soignée.
                    </p>
                </div>

                {/* ── Controls ── */}
                <div
                    className="animate-fade-in-up stagger-2"
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "32px",
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    {/* Search */}
                    <div
                        style={{
                            position: "relative",
                            flex: "1",
                            minWidth: "240px",
                        }}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                            }}
                        >
                            <circle
                                cx="6.5"
                                cy="6.5"
                                r="4.5"
                                stroke="#6b5e63"
                                strokeWidth="1.3"
                            />
                            <path
                                d="M10 10L13.5 13.5"
                                stroke="#6b5e63"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <input
                            className="input-base"
                            type="text"
                            placeholder="Rechercher un service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: "36px" }}
                        />
                    </div>

                    {/* Category filter */}
                    <select
                        className="input-base"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            width: "auto",
                            minWidth: "160px",
                            cursor: "pointer",
                        }}
                    >
                        <option value="">Toutes catégories</option>
                        {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Add button */}
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setEditingService(null);
                            setModalOpen(true);
                        }}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        + Nouveau service
                    </button>
                </div>

                {/* ── Grid ── */}
                {filtered.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        {filtered.map((service, i) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                index={i}
                            />
                        ))}
                    </div>
                ) : (
                    /* ── Empty state ── */
                    <div
                        className="animate-fade-in"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "80px 24px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "20px",
                                background: "var(--rose-muted)",
                                border: "1px solid #e8547a30",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "20px",
                                boxShadow: "0 0 30px #e8547a15",
                            }}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 28 28"
                                fill="none"
                            >
                                <rect
                                    x="4"
                                    y="4"
                                    width="8"
                                    height="8"
                                    rx="2.5"
                                    fill="#e8547a"
                                    opacity="0.8"
                                />
                                <rect
                                    x="16"
                                    y="4"
                                    width="8"
                                    height="8"
                                    rx="2.5"
                                    fill="#e8547a"
                                    opacity="0.4"
                                />
                                <rect
                                    x="4"
                                    y="16"
                                    width="8"
                                    height="8"
                                    rx="2.5"
                                    fill="#e8547a"
                                    opacity="0.4"
                                />
                                <rect
                                    x="16"
                                    y="16"
                                    width="8"
                                    height="8"
                                    rx="2.5"
                                    fill="#e8547a"
                                    opacity="0.6"
                                />
                            </svg>
                        </div>
                        <h3
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "20px",
                                color: "var(--text-primary)",
                                marginBottom: "8px",
                            }}
                        >
                            {search || filterCategory
                                ? "Aucun résultat"
                                : "Votre dashboard est vide"}
                        </h3>
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "14px",
                                color: "var(--text-muted)",
                                marginBottom: "24px",
                            }}
                        >
                            {search || filterCategory
                                ? "Essayez d'autres termes de recherche"
                                : "Commencez par ajouter votre premier service"}
                        </p>
                        {!search && !filterCategory && (
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setEditingService(null);
                                    setModalOpen(true);
                                }}
                            >
                                + Ajouter mon premier service
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <ServiceModal
                    service={editingService}
                    onSave={handleSave}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingService(null);
                    }}
                />
            )}
        </div>
    );
}
