import { useEffect } from "react";

// UI Utilities
export function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

export function formatTitle(text, limit = 28) {
  return text.length > limit ? text.slice(0, limit) + "…" : text;
}

export function useAutoResize(ref, { minRows = 1, maxRows = 6 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () => {
      el.rows = minRows;
      const computed = window.getComputedStyle(el);
      const lineHeight = parseFloat(computed.lineHeight || "20");
      const border =
        parseFloat(computed.borderTopWidth || "0") +
        parseFloat(computed.borderBottomWidth || "0");
      const padding =
        parseFloat(computed.paddingTop || "0") +
        parseFloat(computed.paddingBottom || "0");
      const contentHeight = el.scrollHeight - padding - border;
      const rows = Math.min(
        maxRows,
        Math.max(minRows, Math.ceil(contentHeight / lineHeight))
      );
      el.rows = rows;
    };
    resize();
    el.addEventListener("input", resize);
    window.addEventListener("resize", resize);
    return () => {
      el.removeEventListener("input", resize);
      window.removeEventListener("resize", resize);
    };
  }, [ref, minRows, maxRows]);
}