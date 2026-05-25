"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/settings", label: "Paramètres" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(10, 10, 10, 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid #2a2a2a"
          : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #e8547a, #c23a5e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px #e8547a40",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.9" />
                <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.5" />
                <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.5" />
                <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "18px",
                color: "#f5f0f2",
                letterSpacing: "-0.02em",
              }}
            >
              TDS
              <span
                style={{
                  background: "linear-gradient(135deg, #e8547a, #f9a8c0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginLeft: "2px",
                }}
              >
                Hub
              </span>
            </span>
          </div>
        </Link>

        {/* Nav desktop */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: isActive ? 500 : 400,
                  fontSize: "14px",
                  color: isActive ? "#e8547a" : "#a89ba0",
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: isActive ? "#e8547a15" : "transparent",
                  border: isActive ? "1px solid #e8547a30" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.target as HTMLElement).style.color = "#f5f0f2";
                    (e.target as HTMLElement).style.background = "#ffffff08";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.target as HTMLElement).style.color = "#a89ba0";
                    (e.target as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <button
          className="btn-primary"
          style={{ fontSize: "13px", padding: "8px 16px" }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-add-service"));
          }}
        >
          + Ajouter
        </button>
      </div>
    </header>
  );
}
