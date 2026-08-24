export default function StatusBadge({ status }) {
  const normalized = (status || 'New').toLowerCase().replace(/\s+/g, '-');

  let badgeClass = 'badge-default';
  if (['new', 'subscribed', 'active'].includes(normalized)) {
    badgeClass = 'badge-success';
  } else if (['contacted', 'in-discussion'].includes(normalized)) {
    badgeClass = 'badge-warning';
  } else if (['quoted', 'completed', 'resolved'].includes(normalized)) {
    badgeClass = 'badge-info';
  } else if (['cancelled', 'unsubscribed', 'archived', 'inactive'].includes(normalized)) {
    badgeClass = 'badge-danger';
  }

  return <span className={`status-badge ${badgeClass}`}>{status}</span>;
}
