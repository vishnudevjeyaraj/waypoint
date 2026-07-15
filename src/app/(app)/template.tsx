// A template re-mounts on every navigation, so this plays a calm fade on each
// route change between Today / Route / Progress / Profile (spec §5). Reduced
// motion is respected via the global prefers-reduced-motion rule.
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ animation: "fade-in 220ms ease-out" }}>{children}</div>
  );
}
