const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aetherahealthcare.com';

export default function SchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['MedicalOrganization', 'LocalBusiness', 'ProfessionalService'],
        '@id': `${siteUrl}/#organization`,
        name: 'Aethera Healthcare Solutions',
        legalName: 'Aethera Healthcare Solutions Private Limited',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/brand/logo-color.svg`,
        },
        description:
          'Full-service medical billing and revenue cycle management company specializing in hospitalist billing, physician group billing, coding, claims, denial management, and credentialing for US healthcare providers.',
        telephone: '+1-863-694-0325',
        email: 'support@aetherahealthcare.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lakeland',
          addressRegion: 'FL',
          addressCountry: 'US',
        },
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
        serviceType: [
          'Medical Billing',
          'Revenue Cycle Management',
          'Medical Coding',
          'Denial Management',
          'Provider Credentialing',
          'Hospitalist Billing',
          'Claims Management',
          'AR Follow-Up',
          'Prior Authorization',
          'Eligibility Verification',
        ],
        knowsAbout: [
          'Medical Billing',
          'ICD-10 Coding',
          'CPT Coding',
          'HIPAA Compliance',
          'Hospital Medicine Billing',
          'Revenue Cycle Management',
          'Healthcare Claims',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Medical Billing Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hospitalist Billing', url: `${siteUrl}/services/hospitalist-billing` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Medical Coding', url: `${siteUrl}/services/medical-coding` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Denial Management', url: `${siteUrl}/services/denial-management` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Provider Credentialing', url: `${siteUrl}/services/credentialing` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AR Follow-Up', url: `${siteUrl}/services/ar-followup` } },
          ],
        },
        sameAs: [
          'https://www.linkedin.com/company/aethera-healthcare-solutions',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Aethera Healthcare Solutions',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/blog?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does outsourcing medical billing cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Aethera Healthcare Solutions charges a percentage of collected revenue, typically 3-8% depending on specialty and volume. There are no upfront fees. Contact us for a custom quote based on your practice size and specialty.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do you specialize in hospitalist billing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Aethera Healthcare Solutions specializes in hospital medicine and hospitalist group billing, including inpatient E/M coding (99221-99239), critical care, observation status, and multi-facility credentialing.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are you HIPAA compliant?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Aethera Healthcare Solutions is fully HIPAA compliant and a Business Associate Agreement (BAA) is available for all clients.',
            },
          },
          {
            '@type': 'Question',
            name: 'How quickly can you take over our billing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A typical billing transition takes 30-45 days. We conduct a full AR review, complete provider enrollments, and go live with zero gap in cash flow.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
