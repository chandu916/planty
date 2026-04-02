export default function GlobalBackground() {
  return (
    <div className="app-fixed-bg" aria-hidden="true">
      <div className="app-fixed-bg__gloss app-fixed-bg__gloss--top" />
      <div className="app-fixed-bg__gloss app-fixed-bg__gloss--sheet" />
      <div className="app-fixed-bg__mist" />
      <div className="app-fixed-bg__veil app-fixed-bg__veil--one" />
      <div className="app-fixed-bg__veil app-fixed-bg__veil--two" />
    </div>
  );
}