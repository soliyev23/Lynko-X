import type { ThemeOption } from "@/lib/themes";

/** Shablonning kichik sxematik ko'rinishi — rasm emas, CSS bilan chiziladi. */
export function ThemePreview({ theme }: { theme: ThemeOption }) {
  const c = theme.colors;
  const r = theme.radius;
  const card = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: r,
  };
  const cards = Array.from({ length: theme.columns });

  return (
    <div
      className="w-full aspect-[16/10] overflow-hidden p-2.5 flex flex-col gap-2"
      style={{ background: c.bg, borderRadius: r + 4 }}
    >
      {/* Sarlavha */}
      <div
        className="h-5 flex items-center px-2 gap-1.5 shrink-0"
        style={{
          background: c.surface,
          borderBottom: `1px solid ${c.border}`,
          borderRadius: r,
          justifyContent: theme.header === "center" ? "center" : "space-between",
        }}
      >
        <div className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: c.primary }}
          />
          <span
            className="h-1.5 w-8 rounded-sm"
            style={{ background: c.text, opacity: 0.8 }}
          />
        </div>
        {theme.header === "left" && (
          <span
            className="h-2.5 w-7 rounded-sm"
            style={{ background: c.primary }}
          />
        )}
      </div>

      {/* Hero */}
      {theme.hero === "banner" && (
        <div
          className="h-9 shrink-0 flex items-end p-1.5"
          style={{
            background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primarySoft} 100%)`,
            borderRadius: r,
          }}
        >
          <span
            className="h-1.5 w-10 rounded-sm"
            style={{ background: c.surface, opacity: 0.9 }}
          />
        </div>
      )}
      {theme.hero === "text" && (
        <div className="h-9 shrink-0 flex flex-col items-center justify-center gap-1">
          <span
            className="h-2 w-16 rounded-sm"
            style={{ background: c.text }}
          />
          <span
            className="h-1 w-24 rounded-sm"
            style={{ background: c.muted, opacity: 0.5 }}
          />
        </div>
      )}
      {theme.hero === "split" && (
        <div className="h-9 shrink-0 grid grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center gap-1">
            <span
              className="h-2 w-12 rounded-sm"
              style={{ background: c.text }}
            />
            <span
              className="h-1 w-16 rounded-sm"
              style={{ background: c.muted, opacity: 0.5 }}
            />
            <span
              className="h-2 w-8 rounded-sm mt-0.5"
              style={{ background: c.primary }}
            />
          </div>
          <div style={{ background: c.primarySoft, borderRadius: r }} />
        </div>
      )}

      {/* Katalog */}
      <div className="flex-1 flex gap-1.5 min-h-0">
        {theme.hero === "none" && (
          <div
            className="w-8 shrink-0 p-1 flex flex-col gap-1"
            style={card}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 rounded-sm"
                style={{
                  background: i === 0 ? c.primary : c.muted,
                  opacity: i === 0 ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        )}
        <div
          className="flex-1 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${theme.columns}, 1fr)` }}
        >
          {cards.map((_, i) => (
            <div key={i} className="flex flex-col gap-1 min-h-0" style={card}>
              <div
                className="flex-1 min-h-0"
                style={{
                  background: c.primarySoft,
                  borderRadius: `${r}px ${r}px 0 0`,
                }}
              />
              <div className="px-1 pb-1 flex flex-col gap-0.5">
                <span
                  className="h-1 w-3/4 rounded-sm"
                  style={{ background: c.text, opacity: 0.7 }}
                />
                <span
                  className="h-1.5 w-1/2 rounded-sm"
                  style={{ background: c.primary }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
