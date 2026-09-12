import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import SectionTitle from '../../sections/SectionTitle';
import { siteConfig } from '../../../seo/seoConfig';

export default function ContactDirectorySection({ content = {}, context = {} }) {
  const settings = context?.settings;
  const eyebrow = content?.eyebrow || 'GLOBAL DIRECTORY';
  const heading = content?.heading || 'Connect with Our Lighting Concierge';
  const phone = settings?.phone || siteConfig.contact.phone;
  const email = settings?.email || siteConfig.contact.email;
  const address = settings?.address || siteConfig.contact.address;
  const hours = settings?.businessHours || siteConfig.contact.hours;

  return (
    <section className="section contact-directory-section">
      <div className="container">
        <SectionTitle
          eyebrow={eyebrow}
          title={heading}
          align={content?.alignment || 'center'}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
          }}
        >
          <div className="why-card">
            <div className="why-icon-box"><MapPin size={24} /></div>
            <h3>FLAGSHIP STUDIO</h3>
            <p>{address}</p>
          </div>
          <div className="why-card">
            <div className="why-icon-box"><Phone size={24} /></div>
            <h3>DIRECT INQUIRIES</h3>
            <p><a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>{phone}</a></p>
          </div>
          <div className="why-card">
            <div className="why-icon-box"><Mail size={24} /></div>
            <h3>CONCIERGE DESK</h3>
            <p><a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a></p>
          </div>
          <div className="why-card">
            <div className="why-icon-box"><Clock size={24} /></div>
            <h3>STUDIO HOURS</h3>
            <p>{hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
