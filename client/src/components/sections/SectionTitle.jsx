export default function SectionTitle({ eyebrow, title, description, align = 'left', className = '' }) {
  return (
    <div className={`section-title ${align} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
