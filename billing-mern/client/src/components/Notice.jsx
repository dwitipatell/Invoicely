export default function Notice({ notice }) {
  if (!notice) return null;
  return <div className={`notice ${notice.type}`}>{notice.text}</div>;
}
