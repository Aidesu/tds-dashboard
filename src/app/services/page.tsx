"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getServices, deleteService } from "@/src/lib/services";
import { Service } from "@/src/types/service";
import ServiceModal from "@/src/components/ServiceModal";
import { addService, updateService } from "@/src/lib/services";

// ─── Types internes ───────────────────────────────────────────────
interface Node {
    svc: Service;
    r: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    pi: number;
}

interface SubNode {
    name: string;
    url: string;
    r: number;
    tx: number;
    ty: number;
}

// ─── Palette verre fumé ───────────────────────────────────────────
const PALETTE = [
    { base: "#e8547a", glow: "232,84,122" },
    { base: "#60a5fa", glow: "96,165,250" },
    { base: "#4ade80", glow: "74,222,128" },
    { base: "#fb923c", glow: "251,146,60" },
    { base: "#a78bfa", glow: "167,139,250" },
    { base: "#fbbf24", glow: "251,191,36" },
    { base: "#34d399", glow: "52,211,153" },
];

const PAD = 20; // anti-collision padding

// ─── Helpers canvas ──────────────────────────────────────────────
function drawGrid(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const step = 36;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.028)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 0; x < W; x += step) {
        for (let y = 0; y < H; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawGlassBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    glow: string,
    alpha: number,
    hovered: boolean,
) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer glow
    const gs = hovered ? 0.2 : 0.08;
    const grad = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.4);
    grad.addColorStop(0, `rgba(${glow},${gs})`);
    grad.addColorStop(1, `rgba(${glow},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Glass body
    const fill = ctx.createRadialGradient(
        x - r * 0.25,
        y - r * 0.3,
        r * 0.1,
        x,
        y,
        r,
    );
    fill.addColorStop(0, `rgba(${glow},0.18)`);
    fill.addColorStop(0.6, `rgba(${glow},0.07)`);
    fill.addColorStop(1, `rgba(${glow},0.14)`);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = `rgba(${glow},${hovered ? 0.85 : 0.4})`;
    ctx.lineWidth = hovered ? 1.5 : 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Specular
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    const hl = ctx.createRadialGradient(
        x - r * 0.3,
        y - r * 0.38,
        r * 0.05,
        x - r * 0.2,
        y - r * 0.28,
        r * 0.55,
    );
    hl.addColorStop(0, "rgba(255,255,255,0.13)");
    hl.addColorStop(0.4, "rgba(255,255,255,0.04)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
    ctx.restore();
}

function drawSyne(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    alpha: number,
) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `800 ${size}px 'Syne', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawDM(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    alpha: number,
) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `400 ${size}px 'DM Sans', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────
export default function ServicesPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef({
        nodes: [] as Node[],
        zoomed: null as Node | null,
        subNodes: [] as SubNode[],
        zoomT: 0,
        t: 0,
        drag: null as {
            node: Node;
            sx: number;
            sy: number;
            offX: number;
            offY: number;
        } | null,
        didDrag: false,
        hovMain: null as Node | null,
        hovSub: -1,
        W: 0,
        H: 0,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [tooltip, setTooltip] = useState<{
        name: string;
        url: string;
        x: number;
        y: number;
    } | null>(null);
    const rafRef = useRef<number>(0);

    // ── Load services → nodes ──
    const loadNodes = useCallback((W: number, H: number) => {
        const svcs = getServices();
        const n = svcs.length || 1;
        const existing = stateRef.current.nodes;
        stateRef.current.nodes = svcs.map((svc, i) => {
            const prev = existing.find((nd) => nd.svc.id === svc.id);
            if (prev) return { ...prev, svc };
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.min(W, H) * 0.3;
            const nameLen = svc.name.length;
            return {
                svc,
                r: Math.max(34, Math.min(58, 28 + nameLen * 2.2)),
                x: W / 2 + Math.cos(angle) * radius,
                y: H / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                pi: i % PALETTE.length,
            };
        });
    }, []);

    // ── Anti-collision ──
    function applyPhysics(nodes: Node[], W: number, H: number) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i],
                    b = nodes[j];
                const dx = b.x - a.x,
                    dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const minD = a.r + b.r + PAD;
                if (dist < minD) {
                    const push = ((minD - dist) / dist) * 0.5;
                    a.x -= dx * push * 0.5;
                    a.y -= dy * push * 0.5;
                    b.x += dx * push * 0.5;
                    b.y += dy * push * 0.5;
                }
            }
            const nd = nodes[i];
            nd.x = Math.max(nd.r + 10, Math.min(W - nd.r - 10, nd.x));
            nd.y = Math.max(nd.r + 10, Math.min(H - nd.r - 10, nd.y));
        }
    }

    // ── Build sub-nodes for zoomed service ──
    function buildSubs(node: Node, W: number, H: number): SubNode[] {
        const subs = node.svc.description
            ? [
                  { name: "Ouvrir", url: node.svc.url },
                  ...((node.svc as any).subPages || []),
              ]
            : [{ name: "Ouvrir", url: node.svc.url }];

        // Try to parse subPages from description field (stored as JSON)
        let pages: { name: string; url: string }[] = [];
        try {
            pages = JSON.parse(node.svc.description || "[]");
        } catch {
            pages = [];
        }
        if (!Array.isArray(pages)) pages = [];
        const all = [{ name: "Ouvrir", url: node.svc.url }, ...pages];

        const n = all.length;
        const orbitR = Math.min(W, H) * 0.27;
        return all.map((s, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return {
                name: s.name,
                url: s.url,
                r: 22 + Math.min(s.name.length * 1.2, 12),
                tx: W / 2 + Math.cos(a) * orbitR * 1.55,
                ty: H / 2 + Math.sin(a) * orbitR * 1.55,
            };
        });
    }

    // ── Main draw loop ──
    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext("2d")!;
        let dpr = 1;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const W = wrap.clientWidth;
            const H = wrap.clientHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
            ctx.scale(dpr, dpr);
            stateRef.current.W = W;
            stateRef.current.H = H;
            loadNodes(W, H);
        }

        resize();
        window.addEventListener("resize", resize);

        function loop() {
            const s = stateRef.current;
            const { W, H, nodes, zoomed, subNodes, hovMain, hovSub } = s;
            s.t += 0.012;
            const t = s.t;

            ctx.clearRect(0, 0, W, H);
            drawGrid(ctx, W, H);

            if (!zoomed) applyPhysics(nodes, W, H);

            if (zoomed) {
                s.zoomT += (1 - s.zoomT) * 0.09;
                const pal = PALETTE[zoomed.pi % PALETTE.length];
                const cx = W / 2,
                    cy = H / 2;
                const bigR = zoomed.r * (1 + s.zoomT * 0.5);

                // Orbit ring
                ctx.save();
                ctx.strokeStyle = `rgba(${pal.glow},0.1)`;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 9]);
                ctx.beginPath();
                ctx.arc(cx, cy, Math.min(W, H) * 0.27 * 1.55, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                // Other nodes dimmed
                nodes
                    .filter((nd) => nd.svc.id !== zoomed.svc.id)
                    .forEach((nd) => {
                        const p2 = PALETTE[nd.pi % PALETTE.length];
                        drawGlassBubble(
                            ctx,
                            nd.x,
                            nd.y,
                            nd.r * 0.5,
                            p2.glow,
                            Math.max(0, 0.12 - s.zoomT * 0.1),
                            false,
                        );
                    });

                // Connectors to subs
                subNodes.forEach(({ tx, ty }) => {
                    const ax = cx + (tx - cx) * s.zoomT,
                        ay = cy + (ty - cy) * s.zoomT;
                    ctx.save();
                    ctx.strokeStyle = `rgba(${pal.glow},0.15)`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 8]);
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(ax, ay);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.restore();
                });

                // Center
                drawGlassBubble(ctx, cx, cy, bigR, pal.glow, 1, false);
                const ns = Math.round(bigR * 0.26 + 8);
                drawSyne(
                    ctx,
                    cx,
                    cy - ns * 0.35,
                    zoomed.svc.name,
                    ns,
                    "#fff",
                    1,
                );
                drawDM(
                    ctx,
                    cx,
                    cy + ns * 0.55,
                    zoomed.svc.url,
                    Math.round(bigR * 0.12 + 7),
                    pal.base,
                    0.6,
                );

                // Subs
                subNodes.forEach(({ name, r: sr, tx, ty }, i) => {
                    const ax = cx + (tx - cx) * s.zoomT;
                    const ay = cy + (ty - cy) * s.zoomT;
                    const pulse = 1 + Math.sin(t * 1.4 + i * 0.9) * 0.03;
                    const drawn = sr * pulse * (0.3 + s.zoomT * 0.7);
                    const isHov = hovSub === i;
                    drawGlassBubble(
                        ctx,
                        ax,
                        ay,
                        drawn,
                        pal.glow,
                        s.zoomT,
                        isHov,
                    );
                    if (s.zoomT > 0.5) {
                        const a2 = (s.zoomT - 0.5) / 0.5;
                        const ls = Math.round(drawn * 0.28 + 7.5);
                        drawSyne(ctx, ax, ay, name, ls, "#fff", a2 * 0.9);
                    }
                });
            } else {
                s.zoomT += (0 - s.zoomT) * 0.1;
                nodes.forEach((nd, i) => {
                    const pal = PALETTE[nd.pi % PALETTE.length];
                    const pulse = 1 + Math.sin(t * 0.9 + i * 1.3) * 0.022;
                    const r = nd.r * pulse;
                    const isHov = hovMain === nd;
                    drawGlassBubble(ctx, nd.x, nd.y, r, pal.glow, 1, isHov);
                    const ns = Math.round(r * 0.22 + 8);
                    drawSyne(
                        ctx,
                        nd.x,
                        nd.y - ns * 0.3,
                        nd.svc.name,
                        ns,
                        "#fff",
                        1,
                    );
                    drawDM(
                        ctx,
                        nd.x,
                        nd.y + ns * 0.55 + 2,
                        nd.svc.url,
                        Math.round(r * 0.1 + 7),
                        pal.base,
                        0.55,
                    );
                });
            }

            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [loadNodes]);

    // ── Pointer helpers ──
    function getXY(e: React.MouseEvent | React.TouchEvent) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const src = "touches" in e ? e.touches[0] : e;
        return { x: src.clientX - rect.left, y: src.clientY - rect.top };
    }

    function hitMain(px: number, py: number) {
        const { nodes } = stateRef.current;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const nd = nodes[i];
            if (Math.hypot(px - nd.x, py - nd.y) < nd.r + 12) return nd;
        }
        return null;
    }

    function hitSub(px: number, py: number) {
        const { subNodes, zoomT, W, H } = stateRef.current;
        const cx = W / 2,
            cy = H / 2;
        for (let i = 0; i < subNodes.length; i++) {
            const { r, tx, ty } = subNodes[i];
            const ax = cx + (tx - cx) * zoomT;
            const ay = cy + (ty - cy) * zoomT;
            if (Math.hypot(px - ax, py - ay) < r + 10) return i;
        }
        return -1;
    }

    // ── Events ──
    function onMouseMove(e: React.MouseEvent) {
        const s = stateRef.current;
        const p = getXY(e);

        if (s.drag) {
            s.drag.node.x = Math.max(
                s.drag.node.r + 8,
                Math.min(s.W - s.drag.node.r - 8, p.x - s.drag.offX),
            );
            s.drag.node.y = Math.max(
                s.drag.node.r + 8,
                Math.min(s.H - s.drag.node.r - 8, p.y - s.drag.offY),
            );
            if (Math.hypot(p.x - s.drag.sx, p.y - s.drag.sy) > 5)
                s.didDrag = true;
            return;
        }

        if (s.zoomed) {
            const si = hitSub(p.x, p.y);
            s.hovSub = si;
            if (si >= 0) {
                const sub = s.subNodes[si];
                setTooltip({
                    name: sub.name,
                    url: sub.url,
                    x: p.x + 14,
                    y: p.y - 10,
                });
                canvasRef.current!.style.cursor = "pointer";
            } else {
                setTooltip(null);
                canvasRef.current!.style.cursor = "default";
            }
        } else {
            const nd = hitMain(p.x, p.y);
            s.hovMain = nd;
            if (nd) {
                setTooltip({
                    name: nd.svc.name,
                    url: nd.svc.url,
                    x: p.x + 14,
                    y: p.y - 10,
                });
                canvasRef.current!.style.cursor = nd ? "grab" : "default";
            } else {
                setTooltip(null);
                canvasRef.current!.style.cursor = "default";
            }
        }
    }

    function onMouseDown(e: React.MouseEvent) {
        const s = stateRef.current;
        const p = getXY(e);

        // Si on est déjà zoomé, on ne veut pas pouvoir "drag" (glisser) le nœud central
        if (s.zoomed) return;

        const nd = hitMain(p.x, p.y);
        if (nd) {
            s.drag = {
                node: nd,
                sx: p.x,
                sy: p.y,
                offX: p.x - nd.x,
                offY: p.y - nd.y,
            };
            s.didDrag = false;
            canvasRef.current!.style.cursor = "grabbing";
        }
    }

    function onMouseUp(e: React.MouseEvent) {
        const s = stateRef.current;

        // Si on n'était pas en train de drag, et qu'on est déjà zoomé :
        // On laisse l'événement onClick gérer le clic sur les sous-nodes.
        if (!s.drag) return;

        const p = getXY(e);

        // Si l'utilisateur n'a pas bougé la souris (vrai clic, pas un glisser-déposer)
        if (!s.didDrag) {
            s.zoomed = s.drag.node;
            s.zoomT = 0;
            s.subNodes = buildSubs(s.drag.node, s.W, s.H);
            setIsZoomed(true);
            setTooltip(null);
        }

        s.drag = null;
        canvasRef.current!.style.cursor = "default";
    }

    function onClick(e: React.MouseEvent) {
        const s = stateRef.current;
        const p = getXY(e);

        // CAS 1 : On est en mode ZOOMÉ -> Clic sur une sous-page
        if (s.zoomed) {
            const si = hitSub(p.x, p.y);
            if (si >= 0) {
                let url = s.subNodes[si].url;
                if (!url) return;

                // Formatage de l'URL si le protocole est manquant
                if (!/^https?:\/\//i.test(url)) {
                    url = "https://" + url;
                }
                window.open(url, "_blank", "noopener,noreferrer");
            }
        }
    }

    function onMouseLeave() {
        const s = stateRef.current;
        s.drag = null;
        s.hovMain = null;
        s.hovSub = -1;
        setTooltip(null);
    }

    function zoomBack() {
        const s = stateRef.current;
        s.zoomed = null;
        s.hovSub = -1;
        setIsZoomed(false);
        setTooltip(null);
    }

    function resetLayout() {
        zoomBack();
        const s = stateRef.current;
        const n = s.nodes.length || 1;
        s.nodes.forEach((nd, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const r2 = Math.min(s.W, s.H) * 0.3;
            nd.x = s.W / 2 + Math.cos(a) * r2;
            nd.y = s.H / 2 + Math.sin(a) * r2;
        });
    }

    function handleSave(data: Omit<Service, "id" | "createdAt" | "updatedAt">) {
        if (editingService) {
            updateService(editingService.id, data);
        } else {
            addService(data);
        }
        const s = stateRef.current;
        loadNodes(s.W, s.H);
        setModalOpen(false);
        setEditingService(null);
    }

    // ─── Render ───────────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: "100vh",
                paddingTop: "80px",
                paddingBottom: "40px",
                background: "#080808",
                position: "relative",
            }}
        >
            <div
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 24px",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        marginBottom: "24px",
                        paddingTop: "32px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: ".1em",
                                marginBottom: "6px",
                            }}
                        >
                            Dashboard orbital
                        </p>
                        <h1
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: "clamp(28px, 4vw, 42px)",
                                color: "var(--text-primary)",
                                letterSpacing: "-.03em",
                                lineHeight: 1.1,
                            }}
                        >
                            Mes <span className="text-gradient">services</span>
                        </h1>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setEditingService(null);
                            setModalOpen(true);
                        }}
                    >
                        + Ajouter un service
                    </button>
                </div>

                {/* Canvas wrap */}
                <div
                    ref={wrapRef}
                    style={{
                        width: "100%",
                        height: "600px",
                        background: "#080808",
                        borderRadius: "20px",
                        border: "1px solid #1c1c1c",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            display: "block",
                            position: "absolute",
                            inset: 0,
                        }}
                        onMouseMove={onMouseMove}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onClick={onClick}
                        onMouseLeave={onMouseLeave}
                    />

                    {/* Controls */}
                    <div
                        style={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            right: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            zIndex: 10,
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                pointerEvents: "none",
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#e8547a",
                                    boxShadow: "0 0 10px #e8547a",
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 800,
                                    fontSize: 14,
                                    color: "#f5f0f2",
                                    letterSpacing: "-.01em",
                                }}
                            >
                                Services
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                pointerEvents: "auto",
                            }}
                        >
                            {isZoomed && (
                                <button
                                    onClick={zoomBack}
                                    style={{
                                        background: "rgba(232,84,122,.1)",
                                        border: "1px solid rgba(232,84,122,.35)",
                                        color: "#e8547a",
                                        borderRadius: 10,
                                        padding: "6px 14px",
                                        fontSize: 12,
                                        fontFamily: "var(--font-body)",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        letterSpacing: ".01em",
                                    }}
                                >
                                    ← Retour
                                </button>
                            )}
                            <button
                                onClick={resetLayout}
                                style={{
                                    background: "rgba(255,255,255,.04)",
                                    border: "1px solid rgba(255,255,255,.08)",
                                    color: "#a89ba0",
                                    borderRadius: 10,
                                    padding: "6px 14px",
                                    fontSize: 12,
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    letterSpacing: ".01em",
                                    transition: "all .2s",
                                }}
                            >
                                ⊞ Réorganiser
                            </button>
                        </div>
                    </div>

                    {/* Hint */}
                    {!isZoomed && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 16,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid rgba(255,255,255,.06)",
                                color: "rgba(255,255,255,.22)",
                                fontSize: 11,
                                fontFamily: "var(--font-body)",
                                borderRadius: 20,
                                padding: "5px 16px",
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                                letterSpacing: ".04em",
                            }}
                        >
                            Glissez les bulles · Cliquez pour explorer
                        </div>
                    )}

                    {/* Tooltip */}
                    {tooltip && (
                        <div
                            style={{
                                position: "absolute",
                                left: tooltip.x,
                                top: tooltip.y,
                                background: "rgba(14,14,14,.95)",
                                border: "1px solid rgba(255,255,255,.08)",
                                borderRadius: 10,
                                padding: "8px 14px",
                                pointerEvents: "none",
                                zIndex: 20,
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: "#f5f0f2",
                                }}
                            >
                                {tooltip.name}
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: 11,
                                    color: "#6b5e63",
                                    marginTop: 2,
                                }}
                            >
                                {tooltip.url}
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: 16,
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        color: "var(--text-muted)",
                    }}
                >
                    Les sous-pages d'un service se configurent dans le champ{" "}
                    <em>Description</em> au format JSON&nbsp;:{" "}
                    <code style={{ color: "#e8547a", fontSize: 11 }}>
                        [{"{"}"name":"Historique","url":"youtube.com/history"
                        {"}"}]
                    </code>
                </p>
            </div>

            {/* Modal */}
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
