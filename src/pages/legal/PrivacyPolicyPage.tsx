import React, { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Em,
  ExternalLink,
  InlineLink,
  LegalCallout,
  LegalContactCard,
  LegalLayout,
  LegalList,
  type LegalSection,
  LegalSubheading,
  SectionLink,
  SUPPORT_EMAIL,
} from './LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'overview',
    title: 'Who we are and what this policy covers',
    content: (
      <>
        <p>
          Genie (“Genie”, “we”, “us” or “our”) runs an online platform where you can sell your used smartphone, laptop,
          tablet or smart TV, with free doorstep pickup in Tamil Nadu, India. This Privacy Policy explains how we handle
          personal data when you visit our website, sign in, request a quote, book a pickup, sell a device to us or
          contact our support team.
        </p>
        <p>
          Under India’s Digital Personal Data Protection Act, 2023 (“DPDP Act”), Genie is the <Em>Data Fiduciary</Em>{' '}
          for your personal data and you are the <Em>Data Principal</Em>. Service providers that process data on our
          behalf are <Em>Data Processors</Em>. This policy is also written to align with the Information Technology
          Act, 2000 and the rules made under it.
        </p>
        <p>
          Please read this policy together with our <InlineLink to="/terms">Terms &amp; Conditions</InlineLink>.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Personal data we collect',
    content: (
      <>
        <p>We collect only what we need to give you a quote, pick up your device, pay you and keep the service safe.</p>
        <LegalSubheading>Information you give us</LegalSubheading>
        <LegalList>
          <li>
            <Em>Account details</Em> — your name and email address. If you use Continue with Google, Google shares your
            name, email address and profile picture with us. If you sign in with an email one-time code (OTP), we use
            your email address to send you the code.
          </li>
          <li>
            <Em>Phone number</Em> — so our agent can coordinate your pickup.
          </li>
          <li>
            <Em>Pickup details</Em> — your pickup address, pincode, city and state, and your preferred pickup date and
            time window.
          </li>
          <li>
            <Em>Device details</Em> — the brand, model and variant you are selling, your answers to the condition
            questionnaire, and the quote generated.
          </li>
          <li>
            <Em>Payout details</Em> — your UPI ID, or your bank account number and IFSC, if you choose to be paid that
            way.
          </li>
          <li>
            <Em>Support enquiries</Em> — the messages, emails and call details you share when you contact us.
          </li>
        </LegalList>
        <LegalSubheading>Information collected at pickup</LegalSubheading>
        <LegalList>
          <li>
            <Em>Identity verification (KYC)</Em> — details of the government-issued photo ID you provide, to confirm you
            are the seller and to help prevent the sale of stolen devices.
          </li>
          <li>
            <Em>Device identifiers</Em> — the IMEI or serial number of the device.
          </li>
          <li>
            <Em>Inspection records</Em> — photos of the device taken during inspection, the inspection results, the
            final offer and whether you accepted or rejected it.
          </li>
        </LegalList>
        <LegalSubheading>Information collected automatically</LegalSubheading>
        <LegalList>
          <li>
            <Em>Technical data</Em> — your IP address, browser type, device and operating system, and server logs (such
            as requests made, timestamps and errors).
          </li>
          <li>
            <Em>Approximate location</Em> — only if you tap “Use my current location” (see{' '}
            <SectionLink id="location">Location data</SectionLink>).
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'location',
    title: 'Location data',
    content: (
      <>
        <p>
          When you tap <Em>“Use my current location”</Em>, your browser asks your permission to share your device’s
          location. If you allow it:
        </p>
        <LegalList>
          <li>
            we use the coordinates only to fill in your address details and pincode, and to check whether we serve your
            area;
          </li>
          <li>
            to find your area, the coordinates are sent to a reverse-geocoding service, which returns the matching
            locality, city, state and pincode; and
          </li>
          <li>
            we do not store your coordinates long-term or use them to track you. The resulting area (such as your
            pincode and city) may be saved in your browser so you do not have to enter it again.
          </li>
        </LegalList>
        <p>
          Sharing your location is optional. You can always type your pincode and address yourself, and you can turn
          off location access at any time in your browser settings.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your data',
    content: (
      <>
        <LegalList>
          <li>
            <Em>Quotes and pickups</Em> — to calculate your quote, schedule your pickup, give our field agent the
            details needed for the visit, inspect your device and make a final offer.
          </li>
          <li>
            <Em>Payments</Em> — to pay you by UPI, bank transfer or cash, and to keep a record of the payment.
          </li>
          <li>
            <Em>Fraud and theft prevention</Em> — to verify your identity, check device identifiers, stop the sale of
            stolen or blacklisted devices and cooperate with law enforcement where needed.
          </li>
          <li>
            <Em>Legal compliance</Em> — to meet our obligations under applicable laws, including KYC, tax and
            record-keeping requirements.
          </li>
          <li>
            <Em>Customer support</Em> — to answer your questions and resolve complaints and grievances.
          </li>
          <li>
            <Em>Service communications</Em> — to send sign-in codes (OTP), booking confirmations and pickup, offer and
            payment updates by email, and to call you to coordinate your pickup.
          </li>
          <li>
            <Em>Keeping the service working and secure</Em> — to fix errors, detect misuse and improve our website.
          </li>
        </LegalList>
        <p>
          Your online quote is calculated automatically from the device and condition you select. The final offer is
          made by a person — our field agent — after physically inspecting the device.
        </p>
        <p>
          We will only send you promotional messages if you have agreed to receive them, and you can opt out at any
          time.
        </p>
      </>
    ),
  },
  {
    id: 'lawful-grounds',
    title: 'Consent and lawful grounds',
    content: (
      <>
        <p>We process your personal data on one of the following grounds under the DPDP Act:</p>
        <LegalList>
          <li>
            <Em>Your consent</Em> — which you give, for example, when you sign in, book a pickup or allow location
            access, for the purposes described in this policy; or
          </li>
          <li>
            <Em>Legitimate uses permitted by law</Em> — such as when you voluntarily give us information for a specific
            purpose (for example, your address so we can collect your device), or when we need to process data to
            comply with a law or with a judgment or order of a court or authority.
          </li>
        </LegalList>
        <p>
          Where we rely on your consent, you can withdraw it at any time, as explained in{' '}
          <SectionLink id="your-rights">Your rights</SectionLink>.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share your data with',
    content: (
      <>
        <LegalCallout title="We do not sell your personal data">
          We share it only when needed to run our service, and each party receives only what it needs for its role.
        </LegalCallout>
        <LegalList>
          <li>
            <Em>Our field agents</Em> — your name, phone number, pickup address and device details, to carry out the
            pickup and inspection.
          </li>
          <li>
            <Em>Google</Em> — when you use Continue with Google, to sign you in. Google’s handling of your data is
            governed by Google’s own privacy policy.
          </li>
          <li>
            <Em>Email delivery provider (SMTP)</Em> — to send your one-time sign-in codes and booking and status
            emails.
          </li>
          <li>
            <Em>Cloud hosting and database providers</Em> — to run our website and store account and order data.
          </li>
          <li>
            <Em>Cloud object storage provider</Em> — to store photos of devices taken during inspection.
          </li>
          <li>
            <Em>Reverse-geocoding service</Em> — to turn your location coordinates into an area and pincode when you use
            “Use my current location”.
          </li>
          <li>
            <Em>Payment networks and banks</Em> (UPI and IMPS) — to send your payout.
          </li>
          <li>
            <Em>Government and law-enforcement authorities</Em> — when required by law or a court order, or when we
            suspect that a device is stolen or involved in fraud.
          </li>
          <li>
            <Em>A successor business</Em> — if Genie is involved in a merger, acquisition or sale of assets, in which
            case your data will remain protected by this policy.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'device-data',
    title: 'Personal data left on devices you sell',
    content: (
      <>
        <p>
          Devices often contain photos, messages and saved logins. Before your pickup, please back up your data,
          factory reset the device, remove your iCloud or Google account, and take out your SIM and memory cards.
        </p>
        <p>
          Our agents access a device only as much as needed to inspect it, and Genie performs a data wipe on every
          device we receive. However, we are not responsible for data left on a device — see{' '}
          <InlineLink to="/terms#data-on-device">Personal data on your device</InlineLink> in our Terms.
        </p>
      </>
    ),
  },
  {
    id: 'browser-storage',
    title: 'Cookies and browser storage',
    content: (
      <>
        <p>
          We <Em>do not use third-party advertising cookies</Em> or track you across other websites. We use your
          browser’s local storage to:
        </p>
        <LegalList>
          <li>keep you signed in (login session tokens and basic account details);</li>
          <li>remember your theme preference (light or dark);</li>
          <li>remember your saved location (such as your pincode and city); and</li>
          <li>remember items you add to your cart.</li>
        </LegalList>
        <p>
          This information stays in your browser. You can clear it at any time from your browser settings — you will be
          signed out and your preferences will be reset. If you use Continue with Google, Google may set its own
          cookies, which are governed by Google’s policies.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep your data',
    content: (
      <>
        <LegalList>
          <li>
            <Em>Account data</Em> — for as long as your account is active. When you ask us to delete your account, we
            delete or anonymise it, except where we must keep it by law.
          </li>
          <li>
            <Em>Transaction records</Em> — including KYC details, IMEI or serial numbers, inspection photos, offers and
            payout records — for as long as applicable laws require (for example, tax, accounting, KYC and anti-theft
            record-keeping), and as needed to resolve disputes or legal claims.
          </li>
          <li>
            <Em>Location coordinates</Em> — not stored long-term; they are used only to look up your area.
          </li>
          <li>
            <Em>Support enquiries</Em> — for as long as needed to resolve your query and keep a reasonable record of it.
          </li>
          <li>
            <Em>Technical logs</Em> — for a limited period for security and troubleshooting, or longer where the law
            requires.
          </li>
        </LegalList>
        <p>
          When personal data is no longer needed for the purpose it was collected for, and we are not required by law
          to keep it, we delete or anonymise it.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect your data',
    content: (
      <>
        <p>We use reasonable security safeguards to protect your personal data, including:</p>
        <LegalList>
          <li>encrypted (HTTPS) connections between your browser and our servers;</li>
          <li>password-free sign-in through Google or one-time codes, so we never store a password for you;</li>
          <li>access limited to staff and field agents who need the data to do their job;</li>
          <li>established cloud providers for hosting, databases and file storage; and</li>
          <li>monitoring of our systems for misuse and unauthorised access.</li>
        </LegalList>
        <p>
          No system is completely secure. If a personal data breach occurs, we will inform affected users, the Data
          Protection Board of India and other relevant authorities as required by law.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <>
        <p>Under the DPDP Act, you have the right to:</p>
        <LegalList>
          <li>
            <Em>Access</Em> — get a summary of the personal data we process about you, our processing activities, and
            the other Data Fiduciaries and Data Processors we have shared it with.
          </li>
          <li>
            <Em>Correction</Em> — have inaccurate or misleading data corrected, incomplete data completed and outdated
            data updated.
          </li>
          <li>
            <Em>Erasure</Em> — ask us to erase personal data we no longer need, unless we must keep it by law.
          </li>
          <li>
            <Em>Withdraw consent</Em> — at any time, as easily as you gave it. This does not affect processing already
            carried out, and some services (such as a pickup) may not be possible without the data they need.
          </li>
          <li>
            <Em>Nominate</Em> — appoint another person to exercise your rights on your behalf in the event of your death
            or incapacity.
          </li>
          <li>
            <Em>Grievance redressal</Em> — raise a complaint with us and, if you are not satisfied with our response,
            approach the Data Protection Board of India.
          </li>
        </LegalList>
        <LegalSubheading>How to exercise your rights</LegalSubheading>
        <p>
          Email us at <ExternalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ExternalLink> from the email
          address linked to your account, or call us. We may need to verify your identity before acting on a request.
        </p>
        <LegalSubheading>Your duties</LegalSubheading>
        <p>
          The DPDP Act also asks you to provide authentic information, not to impersonate anyone, not to suppress
          material information, and not to file false or frivolous complaints.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: "Children's data",
    content: (
      <>
        <p>
          Genie is intended for adults. We do not knowingly process the personal data of anyone under 18 without the
          verifiable consent of their parent or legal guardian, and we do not track, behaviourally monitor or target
          advertising at children.
        </p>
        <p>
          If we learn that we have collected a child’s personal data without such consent, we will delete it promptly,
          unless we are required by law to keep it. Parents and guardians can contact us using the details below.
        </p>
      </>
    ),
  },
  {
    id: 'storage-transfer',
    title: 'Where your data is stored',
    content: (
      <p>
        Your data is stored and processed using cloud hosting, database and storage providers, whose servers may be
        located in India or in other countries. Where personal data is processed outside India, we do so only as
        permitted under the DPDP Act — including any restrictions notified by the Government of India — and it remains
        protected as described in this policy.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy from time to time to reflect changes to our services or the law. When we do, we will
        post the updated policy on this page and change the “Last updated” date above. For significant changes, we will
        make reasonable efforts to notify you — for example, by email or a notice on the website — and, where required
        by law, ask for your consent again.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Grievance redressal and contact',
    content: (
      <>
        <p>For any privacy question, request or grievance, please contact our support and grievance team:</p>
        <LegalContactCard />
        <LegalList>
          <li>
            We acknowledge every grievance <Em>within 48 hours</Em> and resolve it <Em>within 30 days</Em> of receiving
            it.
          </li>
          <li>
            Please include the email address or phone number linked to your account and, if relevant, your request
            number.
          </li>
          <li>
            If you are not satisfied with how we resolve your grievance, you may approach the Data Protection Board of
            India.
          </li>
        </LegalList>
      </>
    ),
  },
];

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Privacy Policy | Genie';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <LegalLayout
      icon={ShieldCheck}
      title="Privacy Policy"
      summary="This policy explains what personal data Genie collects when you use our website and sell a device to us, why we collect it, who we share it with, and the choices and rights you have. It is written to align with India's Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000."
      sections={sections}
      crossLink={{
        to: '/terms',
        title: 'Terms & Conditions',
        description: 'The rules for using Genie — quotes, doorstep pickup, inspection, payment and cancellation.',
      }}
    />
  );
};
