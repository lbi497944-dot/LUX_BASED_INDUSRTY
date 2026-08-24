export default function PageHero({ eyebrow, title, description, image }) {
  return (
    <section
      className="page-hero"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(21, 57, 29, 0.94) 0%, rgba(21, 57, 29, 0.75) 45%, rgba(21, 57, 29, 0.35) 100%), url(${image})`,
      }}
    >
      <div className="container page-hero-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
