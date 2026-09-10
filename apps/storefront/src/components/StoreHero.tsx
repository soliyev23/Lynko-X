import type { StoreInfo } from "@/lib/api";
import type { Theme } from "@/lib/themes";
import { ArrowRightIcon } from "@/components/icons";

/** Do'kon bosh sahifasidagi hero-bo'lim — shablonga qarab har xil ko'rinishda. */
export function StoreHero({ store, theme }: { store: StoreInfo; theme: Theme }) {
  if (theme.hero === "none") {
    return store.description ? (
      <p className="t-muted mb-4 max-w-2xl text-sm">{store.description}</p>
    ) : null;
  }

  if (theme.hero === "text") {
    return (
      <section className="text-center py-10 md:py-16 mb-4">
        <h1 className={`t-heading text-3xl md:text-5xl ${theme.headingClass}`}>
          {store.name}
        </h1>
        {store.description && (
          <p className="t-muted mt-4 max-w-xl mx-auto text-base md:text-lg">
            {store.description}
          </p>
        )}
        {store.bannerUrl && (
          <img
            src={store.bannerUrl}
            alt=""
            className="mt-10 w-full aspect-[21/9] object-cover t-rounded-lg"
          />
        )}
      </section>
    );
  }

  if (theme.hero === "split") {
    return (
      <section className="grid md:grid-cols-2 gap-8 items-center py-8 md:py-14 mb-6">
        <div>
          <h1 className={`t-heading text-4xl md:text-5xl leading-tight ${theme.headingClass}`}>
            {store.name}
          </h1>
          {store.description && (
            <p className="t-muted mt-5 text-lg leading-relaxed">
              {store.description}
            </p>
          )}
          <a href="#catalog" className="t-btn px-6 py-3 mt-8">
            Katalogni ko'rish
            <ArrowRightIcon size={18} />
          </a>
        </div>
        {store.bannerUrl ? (
          <img
            src={store.bannerUrl}
            alt=""
            className="w-full aspect-[4/3] object-cover t-rounded-lg"
          />
        ) : (
          <div className="w-full aspect-[4/3] t-soft t-rounded-lg flex items-center justify-center">
            <span className={`t-heading text-7xl t-primary ${theme.headingClass}`}>
              {store.name[0]}
            </span>
          </div>
        )}
      </section>
    );
  }

  // banner
  return (
    <section className="relative overflow-hidden mb-8 t-rounded-lg">
      {store.bannerUrl ? (
        <>
          <img
            src={store.bannerUrl}
            alt=""
            className="w-full h-56 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
            <h1 className={`t-heading text-3xl md:text-5xl ${theme.headingClass}`}>
              {store.name}
            </h1>
            {store.description && (
              <p className="mt-2 max-w-xl text-white/85 md:text-lg">
                {store.description}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="t-soft p-8 md:p-12">
          <h1 className={`t-heading text-3xl md:text-5xl ${theme.headingClass}`}>
            {store.name}
          </h1>
          {store.description && (
            <p className="t-muted mt-3 max-w-xl md:text-lg">{store.description}</p>
          )}
        </div>
      )}
    </section>
  );
}
