import LegalPage from './LegalPage'
import { LEGAL } from './legalDetails'

const SECTIONS = [
  {
    title: 'Agreement to these terms',
    body: [
      `These terms are an agreement between you and ${LEGAL.company}, ${LEGAL.address} ("Brewloop", "we"). By using Brewloop you accept them and our Privacy Policy. If you do not agree, please do not use the service. If you accept on behalf of a business, you confirm that you have the authority to bind it.`,
    ],
  },
  {
    title: 'What Brewloop is',
    body: [
      'Brewloop is software that helps cafés and other shops ("Businesses") issue digital loyalty cards, record bills, run stamp offers, and view analytics, and lets their customers ("Customers") see their cards, rewards and receipts.',
      'We provide the software only. We do not sell food or drink, and we are not a party to any purchase between a Business and a Customer.',
    ],
  },
  {
    title: 'Eligibility and accounts',
    body: [
      {
        list: [
          'You must be able to form a binding contract under Indian law, which generally means being 18 or older. A person under 18 may use a loyalty card only with the consent of a parent or lawful guardian.',
          'Give accurate details and keep them up to date.',
          'Keep your password private. You are responsible for activity under your account unless it results from our own fault.',
          'Change any temporary password when you first sign in, and tell us promptly about any unauthorised use.',
          'Accounts may be locked after repeated failed sign-ins, as a security measure.',
        ],
      },
    ],
  },
  {
    title: 'Loyalty cards, stamps and rewards',
    body: [
      {
        list: [
          'Each Business creates, runs and honours its own offers. Its rules, including any minimum spend or cap, apply to that offer.',
          'Stamps and rewards belong to the Business’s programme. They have no cash value and cannot be sold, or transferred unless the Business allows it.',
          'Stamps and rewards at one Business cannot be used at another.',
          'A Business may change or end an offer, subject to the law and to any promise it has made to you. Please check with the Business before relying on one.',
          'If a bill is voided, the stamps and unused rewards it earned may be reversed, and a reward used on it may be returned.',
          'Questions about a product, bill, refund or reward should go first to the Business. We can help with technical issues.',
        ],
      },
    ],
  },
  {
    title: 'Business plans and fees',
    body: [
      {
        list: [
          'Businesses subscribe to a plan, and the features and any SMS allowance depend on that plan. Unused SMS allowance does not carry over unless we say so.',
          'Fees, billing periods and taxes are as set out in your order or invoice. Unless the law or your order says otherwise, fees already paid are not refundable.',
          'We may suspend paid features if an amount remains overdue after we have given you notice.',
          'We will give reasonable notice before changing a plan’s fees or removing a significant feature.',
        ],
      },
    ],
  },
  {
    title: 'Business responsibilities',
    body: [
      'If you use Brewloop as a Business, you are responsible for:',
      {
        list: [
          'giving Customers the notices required by law and obtaining any consent needed before adding their data, including when staff enter it at the counter;',
          'not entering sensitive information about Customers, such as health or financial account details;',
          'honouring your offers and rewards, and handling your own refunds and consumer complaints;',
          'the accuracy of your menu, prices and bills, and your own tax and invoicing obligations;',
          'sending promotional messages only with valid consent and in line with TRAI commercial communication rules;',
          'what your staff do on Brewloop, and removing their access when they leave.',
        ],
      },
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You must not:',
      {
        list: [
          'break the law, or add data about someone without the right to do so;',
          'create false stamps, bills or rewards, or otherwise abuse a loyalty programme;',
          'send spam or harmful messages;',
          'access accounts or data that are not yours, or test or bypass our security without written permission;',
          'copy, reverse engineer or resell Brewloop, or overload it or scrape it by automated means.',
        ],
      },
    ],
  },
  {
    title: 'Content and ownership',
    body: [
      'Brewloop, including its software, design and brand, belongs to us or our licensors. We give you a limited, non-exclusive, non-transferable right to use it under these terms.',
      'Businesses and Customers keep their rights in the data they provide. You allow us to use it only as needed to run and support Brewloop, as described in our Privacy Policy. We may use anonymised, aggregated information to improve the service.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'We work to keep Brewloop reliable but do not promise it will be uninterrupted or error-free. We may carry out maintenance and may change features. Businesses should keep their own records of anything they are legally required to retain.',
    ],
  },
  {
    title: 'Disclaimers',
    body: [
      'To the extent the law allows, Brewloop is provided "as is" and "as available", without warranties of any kind beyond those the law does not allow us to exclude. We do not guarantee that a loyalty programme will increase sales or repeat visits, or that analytics will be free of error.',
    ],
  },
  {
    title: 'Limits on liability',
    body: [
      `To the extent the law allows, we are not liable for indirect or consequential loss, or for loss of profit, goodwill or data. Our total liability for all claims relating to Brewloop in any 12-month period is limited to the higher of the fees you paid us in that period and ${LEGAL.liabilityCap}.`,
      'Nothing in these terms limits liability for fraud, for wilful misconduct, or for anything else that cannot legally be limited, and nothing removes your rights under the Consumer Protection Act, 2019 or data protection law.',
    ],
  },
  {
    title: 'Indemnity',
    body: [
      'If you are a Business, you will compensate us for reasonable losses and costs arising from third-party claims caused by your offers, your products, your messages, your handling of Customer data, or your breach of these terms, except to the extent we caused them.',
    ],
  },
  {
    title: 'Suspension and termination',
    body: [
      'You may stop using Brewloop at any time. We may suspend or end access if you seriously or repeatedly breach these terms, if an account puts others at risk, or if the law requires it. Where reasonable, we will give notice first.',
      'After closure, Businesses may ask for an export of their data within a reasonable period, subject to our Privacy Policy. Terms that by their nature should continue, such as those on liability and disputes, will continue.',
    ],
  },
  {
    title: 'Governing law and disputes',
    body: [
      `These terms are governed by the laws of India. Please contact us first so we can try to resolve any dispute. If it is not resolved within 30 days, it will be settled by arbitration before a sole arbitrator under the Arbitration and Conciliation Act, 1996, seated in ${LEGAL.disputeCity} and conducted in English. Subject to that, the courts at ${LEGAL.disputeCity} have jurisdiction.`,
      'If you are a consumer, this does not stop you from using a consumer forum or any other remedy you are entitled to by law.',
    ],
  },
  {
    title: 'Changes to these terms',
    body: [
      'We may update these terms. The date at the top shows the latest version. We will give reasonable notice of important changes. If you continue using Brewloop after they take effect, you accept the updated terms. If you do not agree, please stop using it.',
    ],
  },
  {
    title: 'General',
    body: [
      'If part of these terms is found unenforceable, the rest continues to apply. A failure to enforce a term is not a waiver of it. You may not transfer these terms without our consent. We may transfer them as part of a reorganisation or sale of our business, with your rights unaffected. Neither of us is liable for delays caused by events beyond reasonable control.',
    ],
  },
  {
    title: 'Contact and grievances',
    body: [
      `Questions or complaints: ${LEGAL.grievanceOfficer} (Grievance Officer), ${LEGAL.company}, ${LEGAL.address}. Email: ${LEGAL.email}.`,
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="The rules for using Brewloop, whether you collect stamps at a café or run a loyalty programme for one."
      sections={SECTIONS}
    />
  )
}
