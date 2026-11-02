import LegalPage from './LegalPage'
import { LEGAL } from './legalDetails'

const SECTIONS = [
  {
    title: 'Who we are and what this covers',
    body: [
      `Brewloop is a loyalty platform operated by ${LEGAL.company}, ${LEGAL.address} ("Brewloop", "we"). Cafés and other shops use it to issue digital loyalty cards, record bills, and run stamp offers. Their customers use it to see their cards, rewards and receipts.`,
      'This policy explains what personal data is handled through Brewloop, why, and the choices you have. It is written with India’s Digital Personal Data Protection Act, 2023 and the rules made under it in mind.',
    ],
  },
  {
    title: 'Who is responsible for your data',
    body: [
      'Responsibility depends on your relationship with us:',
      {
        list: [
          'If you are a café’s customer: that café decides why and how your loyalty and bill data is used, so it is the Data Fiduciary. We process that data on the café’s behalf.',
          'If you run or work at a café, or administer Brewloop: we are the Data Fiduciary for your account details and for how the platform itself is run.',
        ],
      },
      'Each café has its own privacy duties to its customers. For a question about what a particular café does with your data, you can ask the café or write to us and we will help direct it.',
    ],
  },
  {
    title: 'Personal data we handle',
    body: [
      {
        list: [
          'Customer details: name and mobile number, and optionally email address and birthday. Café staff may enter these at the counter on your behalf.',
          'Loyalty data: card number and QR code, stamps, offer progress, and rewards earned or redeemed.',
          'Purchase data: date and time, café, items, amounts, discounts, and voided bills.',
          'Business account data: staff and manager names, phone numbers, email addresses, roles, password and login records, and business and plan details.',
          'Messaging data: records of SMS messages sent, including their purpose and time.',
          'Technical data: IP address, browser details, and the data your browser stores to keep you signed in and remember your theme.',
        ],
      },
      'Our terms require cafés not to enter sensitive information such as health or financial account details. Brewloop records bills but does not process card or UPI payments.',
    ],
  },
  {
    title: 'How we use personal data',
    body: [
      {
        list: [
          'To run loyalty cards: identifying you at the counter, adding stamps, and applying rewards.',
          'To show you your cards, rewards and receipts in the customer portal.',
          'To give cafés the customer records, bills and analytics their plan includes.',
          'To send service messages, such as a card link or a reward alert.',
          'To send promotional messages for a café, where the required consent exists.',
          'To secure accounts, prevent fraud, provide support, and improve the service.',
          'To meet legal, tax and accounting obligations and to enforce our terms.',
        ],
      },
      'We do not sell personal data, and we do not use a customer’s data to advertise on behalf of other businesses.',
    ],
  },
  {
    title: 'Consent and lawful use',
    body: [
      'Personal data is processed on the basis of consent or another use the law permits, such as a purchase you asked for or a legal obligation. Where a café adds you at the counter, the café is responsible for telling you what it collects and why, and for obtaining any consent needed.',
      'You may withdraw consent at any time, as easily as you gave it, by contacting the café or us. Withdrawal does not affect anything done before it, but the loyalty service may no longer be available to you afterwards.',
      'Promotional SMS messages follow the applicable TRAI commercial communication rules. You can opt out of them without affecting your loyalty card.',
    ],
  },
  {
    title: 'What cafés and others can see',
    body: [
      {
        list: [
          'A café can see the data of its own customers. It does not see your cards, stamps or bills at other cafés.',
          'Authorised Brewloop administrators can access account and business data where needed to run, secure and support the service.',
          'If you hold cards at several cafés, we match them by your mobile number or email address so that they appear together in your own portal.',
          'Service providers that help us run Brewloop, such as hosting and SMS delivery companies, receive only what they need and must protect it. Current providers: [list providers before publishing].',
          'Our pages load fonts from Google Fonts, which means Google receives your IP address when a page loads.',
          'Government or court authorities, where the law requires it. Also a successor business if Brewloop is reorganised or sold, subject to this policy.',
        ],
      },
    ],
  },
  {
    title: 'How long we keep data',
    body: [
      'We keep personal data only for as long as it is needed for the purposes above. Bills and related records may be kept for as long as tax and accounting laws require.',
      `After a verified deletion request or the closure of an account, we delete or anonymise data within ${LEGAL.deletionPeriod}, unless the law requires us to keep it longer. Copies in backups are removed as those backups expire.`,
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Subject to applicable law, you have the right to:',
      {
        list: [
          'get a summary of your personal data and how it is processed, and of who it has been shared with;',
          'have your data corrected, completed, updated or erased;',
          'withdraw consent you have given;',
          'have a grievance addressed, and escalate it to the Data Protection Board of India;',
          'nominate someone to exercise these rights if you die or become unable to do so.',
        ],
      },
      `To use these rights, write to ${LEGAL.email}. We may need to verify your identity first. Please also meet your own duties under the law, such as not giving false details or impersonating anyone.`,
    ],
  },
  {
    title: 'Security',
    body: [
      'We use reasonable technical and organisational safeguards to protect personal data, and we limit access by role. No system is completely secure, however. If a personal data breach occurs, we will notify the affected people and the authorities as the law requires.',
      'Please keep your password private and tell us if you suspect someone has used your account.',
    ],
  },
  {
    title: 'Children',
    body: [
      'Brewloop is intended for people aged 18 and over. A person under 18 may use a loyalty card only with verifiable consent from a parent or lawful guardian. We do not track or target advertising at children. If you believe a child’s data has been added without that consent, contact us and we will act on it.',
    ],
  },
  {
    title: 'Browser storage',
    body: [
      'Brewloop uses your browser’s storage to keep you signed in and to remember your theme and preferences. We do not use advertising cookies. If you clear this storage, you will be signed out.',
    ],
  },
  {
    title: 'Data outside India',
    body: [
      'Your data may be processed outside India where our service providers operate, as permitted by law and subject to any restrictions the Government of India notifies.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this policy as Brewloop or the law changes. The date at the top shows the latest version. We will give reasonable notice of important changes, and ask for fresh consent where the law requires it.',
    ],
  },
  {
    title: 'Grievances and contact',
    body: [
      `Grievance Officer: ${LEGAL.grievanceOfficer}, ${LEGAL.company}, ${LEGAL.address}. Email: ${LEGAL.email}.`,
      'Please tell us what happened and how to reach you. We aim to acknowledge complaints promptly and resolve them within the time the law allows. If you are not satisfied, you may complain to the Data Protection Board of India once you have used this process.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="What personal data Brewloop handles, why, who can see it, and the rights you have over it."
      sections={SECTIONS}
    />
  )
}
