import React, { useEffect } from 'react';
import { Scale } from 'lucide-react';
import {
  Em,
  ExternalLink,
  InlineLink,
  LegalCallout,
  LegalContactCard,
  LegalLayout,
  LegalList,
  LegalOrderedList,
  type LegalSection,
  LegalSubheading,
  SectionLink,
  SUPPORT_EMAIL,
} from './LegalLayout';

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    content: (
      <>
        <p>
          These Terms &amp; Conditions (“Terms”) govern your use of the Genie website and the services we offer for
          selling your used devices to us. In these Terms, “Genie”, “we”, “us” and “our” refer to the operator of the
          Genie platform, and “you” refers to anyone who uses the website or sells a device to us.
        </p>
        <p>
          By browsing the website, signing in, requesting a quote or booking a pickup, you confirm that you have read,
          understood and agree to these Terms and to our <InlineLink to="/privacy">Privacy Policy</InlineLink>. If you
          do not agree, please do not use our services.
        </p>
        <p>
          These Terms are an electronic record under the Information Technology Act, 2000 and the rules made under it,
          and do not need a physical or digital signature to be binding.
        </p>
      </>
    ),
  },
  {
    id: 'how-it-works',
    title: 'How Genie works',
    content: (
      <>
        <p>
          Genie buys used smartphones, laptops, tablets and smart TVs directly from customers. Selling a device to us
          works like this:
        </p>
        <LegalOrderedList>
          <li>
            <Em>Choose your device</Em> — select the brand, model and variant (for example, storage size).
          </li>
          <li>
            <Em>Describe its condition</Em> — answer our condition questionnaire honestly.
          </li>
          <li>
            <Em>Get an online quote</Em> — we show you an indicative price based on your answers.
          </li>
          <li>
            <Em>Book a free doorstep pickup</Em> — choose your address, date and preferred time window.
          </li>
          <li>
            <Em>Inspection and final offer</Em> — our field agent inspects the device at your doorstep and makes a
            final offer.
          </li>
          <li>
            <Em>Accept and get paid, or reject</Em> — if you accept, you are paid before the agent leaves; if you
            reject, the device stays with you at no cost.
          </li>
        </LegalOrderedList>
        <p>
          Doorstep pickup is currently available only in serviceable pincodes in <Em>Tamil Nadu, India</Em>. You can
          check whether we serve your pincode while booking. We may expand, reduce or change our service area at any
          time.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    content: (
      <>
        <p>To use Genie and sell a device to us:</p>
        <LegalList>
          <li>
            You must be at least 18 years old and able to enter into a legally binding contract under Indian law.
          </li>
          <li>
            If you are under 18, you may sell a device only with the consent and involvement of your parent or legal
            guardian, who may be asked to be present at pickup and to complete identity verification.
          </li>
          <li>You must be the lawful owner of the device you are selling.</li>
          <li>Your pickup address must be within our service area.</li>
        </LegalList>
        <p>We may decline to provide our services if we reasonably believe these conditions are not met.</p>
      </>
    ),
  },
  {
    id: 'account',
    title: 'Your account and sign-in',
    content: (
      <>
        <p>
          You can sign in to Genie in two ways: with <Em>Continue with Google</Em>, or with a{' '}
          <Em>one-time code (OTP) sent to your email address</Em>. We do not use passwords.
        </p>
        <LegalList>
          <li>
            Keep your Google account and email inbox secure — anyone who can access them may be able to sign in to
            your Genie account.
          </li>
          <li>Never share your one-time code with anyone, including someone who claims to be from Genie.</li>
          <li>Give us accurate details (name, email and phone number) and keep them up to date.</li>
          <li>
            You are responsible for activity carried out through your account. If you think someone else has accessed
            it, contact us immediately at <ExternalLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ExternalLink>.
          </li>
        </LegalList>
        <p>
          We may suspend or close an account that breaches these Terms, is used for fraud, or is linked to a suspected
          stolen device. You can ask us to close your account at any time by contacting support; records we are
          required to keep by law will be retained as described in our{' '}
          <InlineLink to="/privacy">Privacy Policy</InlineLink>.
        </p>
      </>
    ),
  },
  {
    id: 'your-device',
    title: 'Your device: ownership and declarations',
    content: (
      <>
        <p>When you request a quote or book a pickup, you confirm that:</p>
        <LegalList>
          <li>You are the lawful owner of the device and have the full right to sell it.</li>
          <li>
            The device is not stolen, lost or obtained unlawfully, and is not blacklisted or blocked (for example,
            reported on the Central Equipment Identity Register or by a mobile network).
          </li>
          <li>
            The device is not under a finance or EMI lock, lease, or any other claim by a third party such as a lender.
          </li>
          <li>The IMEI or serial number has not been altered or tampered with.</li>
          <li>
            The details you give us about the device — model, variant and condition — are true and complete to the
            best of your knowledge.
          </li>
        </LegalList>
        <p>Before the pickup, you must also:</p>
        <LegalList>
          <li>
            Remove all account locks — sign out of iCloud and turn off Find My on Apple devices, and remove your Google
            account (Factory Reset Protection, or FRP) on Android devices.
          </li>
          <li>Remove your SIM card(s) and memory card(s).</li>
          <li>
            Back up and erase your personal data, as explained in{' '}
            <SectionLink id="data-on-device">Personal data on your device</SectionLink>.
          </li>
        </LegalList>
        <LegalCallout title="Locked devices">
          A device that is still locked to an iCloud or Google account cannot be bought until the lock is removed. If
          the lock cannot be removed at pickup, the agent may be unable to complete the purchase.
        </LegalCallout>
      </>
    ),
  },
  {
    id: 'pricing',
    title: 'Pricing and online quotes',
    content: (
      <>
        <LegalCallout title="Your online quote is indicative">
          It is an estimate, not a binding offer. The final price is the offer our agent makes after physically
          inspecting your device.
        </LegalCallout>
        <LegalList>
          <li>
            The online quote is calculated automatically from the device, variant and condition you select. Its
            accuracy depends on the information you give us.
          </li>
          <li>
            Quotes are valid for a limited time only. Prices of used devices change with the market — for example,
            with new launches and demand — so if your quote has expired by the time of pickup, the offer will be based
            on the price at that time.
          </li>
          <li>
            If a price is shown incorrectly because of a technical or pricing error, we are not bound by it. We will
            tell you the correct price before you hand over your device.
          </li>
          <li>Promotional offers, if any, are subject to the conditions shown with them.</li>
          <li>All prices are in Indian Rupees (₹).</li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'pickup-inspection',
    title: 'Doorstep pickup and inspection',
    content: (
      <>
        <p>
          Pickup is free. Our field agent visits the address you provided during the date and time window you chose.
          We aim to arrive on time, but delays can occasionally happen because of traffic, weather or other factors.
        </p>
        <LegalSubheading>At the pickup, please</LegalSubheading>
        <LegalList>
          <li>Be available at the address with the device and any accessories you included in your quote.</li>
          <li>
            <Em>Show a valid, original government-issued photo ID</Em> (such as Aadhaar, PAN card, voter ID, driving
            licence or passport). The name must match the seller. We verify identity (KYC) to prevent the sale of stolen
            devices; we cannot complete a purchase without valid ID.
          </li>
          <li>Unlock the device if needed so the agent can run inspection tests.</li>
        </LegalList>
        <LegalSubheading>Inspection and final offer</LegalSubheading>
        <p>
          The agent physically inspects the device — including its screen, body, buttons, cameras, battery and key
          functions — records its IMEI or serial number and may take photos of it. Based on the inspection, the agent
          makes a <Em>final offer</Em>.
        </p>
        <p>
          The final offer may differ from your online quote if the device’s actual condition, model, variant or
          functionality does not match what you declared.
        </p>
        <LegalSubheading>Your choice</LegalSubheading>
        <LegalList>
          <li>
            <Em>Accept</Em> — you are paid before the agent leaves with your device (see{' '}
            <SectionLink id="payment">Payment</SectionLink>).
          </li>
          <li>
            <Em>Reject</Em> — the device stays with you and you pay nothing. There is no charge for the pickup or the
            inspection.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'payment',
    title: 'Payment',
    content: (
      <>
        <LegalList>
          <li>
            Once you accept the final offer, we pay you the full accepted amount before our agent leaves with your
            device.
          </li>
          <li>
            You can be paid by <Em>UPI</Em>, <Em>bank transfer (IMPS)</Em> or <Em>cash</Em>.
          </li>
          <li>
            For UPI or bank transfers, you are responsible for giving us correct payout details — your UPI ID, or your
            bank account number and IFSC. We are not responsible for payments sent to incorrect details that you
            provide.
          </li>
          <li>
            Cash payments are subject to limits under Indian law, so higher-value payouts may need to be made by UPI or
            bank transfer.
          </li>
          <li>
            If a completed transfer is reversed or not credited because of a bank or UPI network issue, contact us and
            we will work with you and the bank to resolve it.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'ownership-transfer',
    title: 'Transfer of ownership',
    content: (
      <>
        <p>
          Ownership of the device — and all risk in it — passes to Genie when payment of the accepted final offer is
          completed. Until then, the device remains yours. Any accessories you hand over with the device form part of
          the sale.
        </p>
        <p>
          Once payment is completed, the sale is final and we cannot return the device. If it later turns out that the
          device was stolen, blacklisted or under a finance lock, or that your declarations were false, we may take the
          steps described in <SectionLink id="stolen-devices">Suspected stolen devices and fraud</SectionLink>.
        </p>
      </>
    ),
  },
  {
    id: 'data-on-device',
    title: 'Personal data on your device',
    content: (
      <>
        <p>
          Phones, laptops and tablets hold photos, messages, saved passwords, payment apps and other personal
          information. Before handing over your device, please:
        </p>
        <LegalList>
          <li>Back up everything you want to keep.</li>
          <li>Sign out of all accounts and remove iCloud / Google account locks.</li>
          <li>Factory reset the device so that all content and settings are erased.</li>
          <li>Remove SIM cards, memory cards and anything else, such as cards kept in the phone case.</li>
        </LegalList>
        <p>
          Our agents access a device only as much as needed to inspect it, and Genie performs a data wipe on every
          device we receive. However, removing your data is your responsibility, and to the extent permitted by law we
          are not responsible for any data left on a device after it is handed over.
        </p>
      </>
    ),
  },
  {
    id: 'cancellation',
    title: 'Cancellation and rescheduling',
    content: (
      <>
        <LegalSubheading>If you want to cancel</LegalSubheading>
        <LegalList>
          <li>
            You can cancel a booked pickup at any time <Em>before the agent arrives</Em>, free of charge — from the{' '}
            <InlineLink to="/track">Track Order</InlineLink> page or by contacting support.
          </li>
          <li>
            At the doorstep, you can still reject the final offer; the device stays with you and nothing is charged.
          </li>
          <li>
            Once payment for an accepted offer is completed, <Em>the sale is final</Em> and cannot be cancelled or
            reversed.
          </li>
        </LegalList>
        <LegalSubheading>If we need to cancel or reschedule</LegalSubheading>
        <p>We may reschedule or cancel a pickup, including where:</p>
        <LegalList>
          <li>your pincode is not currently serviceable;</li>
          <li>identity verification (KYC) fails or the ID does not match the seller;</li>
          <li>we suspect the device is stolen, blacklisted, under a finance lock or tampered with;</li>
          <li>the device is still locked to an iCloud or Google account;</li>
          <li>the information provided is false or incomplete, or we cannot reach you at the scheduled time; or</li>
          <li>events beyond our reasonable control, such as severe weather or public emergencies, prevent the visit.</li>
        </LegalList>
        <p>If we cancel or reschedule a pickup, we will let you know, and you will not be charged anything.</p>
      </>
    ),
  },
  {
    id: 'stolen-devices',
    title: 'Suspected stolen devices and fraud',
    content: (
      <>
        <p>
          We take device theft seriously. If we have reason to believe that a device is stolen, lost, blacklisted, under
          a finance lock, or offered using false information or documents, we may:
        </p>
        <LegalList>
          <li>refuse, suspend or cancel the transaction at any stage;</li>
          <li>keep records of the transaction, the identity documents provided and the device identifiers;</li>
          <li>
            report the matter to the police or other authorities, and share relevant information with them as required
            or permitted by law; and
          </li>
          <li>
            where we have already paid for the device, cooperate with the authorities (including handing over the
            device) and seek to recover the amount paid.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'prohibited-use',
    title: 'Prohibited use',
    content: (
      <>
        <p>When using Genie, you must not:</p>
        <LegalList>
          <li>sell or try to sell a device you do not lawfully own, or one that is stolen, counterfeit or tampered with;</li>
          <li>give false information about yourself or a device, or impersonate anyone;</li>
          <li>use another person’s identity documents, account or payout details without their authorisation;</li>
          <li>use bots, scrapers or other automated means to access the website, collect prices or create bookings;</li>
          <li>
            attempt to hack, probe, disrupt or overload our website or systems, or get around any security measure;
          </li>
          <li>misuse promotional offers, for example through multiple accounts or fake bookings;</li>
          <li>harass, threaten or abuse our agents or staff; or</li>
          <li>use our services for any unlawful purpose.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    content: (
      <>
        <p>
          The Genie name and logo, and the website’s design, text, graphics, illustrations and software, are owned by or
          licensed to Genie and are protected by intellectual property laws. You may use the website for your personal,
          non-commercial use only. You may not copy, reproduce, modify, distribute or create derivative works from it
          without our prior written permission.
        </p>
        <p>
          Device brand names, model names and logos belong to their respective owners. We use them only to identify
          devices, and their use does not imply any endorsement by or affiliation with those owners.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: (
      <>
        <p>
          We work hard to keep our website accurate and available, but it is provided on an “as is” and “as available”
          basis, and we cannot guarantee that it will always be uninterrupted or error-free.
        </p>
        <p>To the maximum extent permitted by law:</p>
        <LegalList>
          <li>
            Genie is not liable for any indirect, incidental, special or consequential loss, including loss of data,
            profit or opportunity;
          </li>
          <li>Genie is not responsible for personal data left on a device you sell to us;</li>
          <li>
            Genie is not liable for delays or failures caused by events beyond our reasonable control; and
          </li>
          <li>
            our total liability for any claim relating to a transaction is limited to the amount paid or payable to you
            for the device in that transaction.
          </li>
        </LegalList>
        <p>
          Nothing in these Terms excludes or limits any liability that cannot be excluded or limited under applicable
          law, including your rights under the Consumer Protection Act, 2019.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Indemnity',
    content: (
      <>
        <p>
          You agree to indemnify and hold harmless Genie, its employees and field agents from any claims, losses,
          liabilities, penalties and expenses (including reasonable legal fees) arising from:
        </p>
        <LegalList>
          <li>your breach of these Terms;</li>
          <li>any false or misleading information or declarations you provide;</li>
          <li>
            the sale of a device you do not lawfully own, or one that is stolen, blacklisted or subject to a third-party
            claim; or
          </li>
          <li>your violation of any law or of the rights of any third party.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law and jurisdiction',
    content: (
      <>
        <p>
          These Terms are governed by the laws of India. Subject to your rights under applicable consumer protection
          law, the courts at <Em>Chennai, Tamil Nadu</Em> have exclusive jurisdiction over any dispute arising out of or
          in connection with these Terms or our services.
        </p>
        <p>
          Before going to court, we encourage you to contact us — most issues can be resolved quickly through our{' '}
          <SectionLink id="grievance">grievance process</SectionLink>.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    content: (
      <>
        <p>
          We may update these Terms from time to time to reflect changes to our services, the law or our business. When
          we do, we will post the updated Terms on this page and change the “Last updated” date above. For significant
          changes, we will make reasonable efforts to notify you, for example by email or a notice on the website.
        </p>
        <p>
          Updated Terms apply from the date they are posted and do not affect transactions completed before that date.
          By continuing to use Genie after an update, you accept the updated Terms.
        </p>
      </>
    ),
  },
  {
    id: 'general',
    title: 'General',
    content: (
      <LegalList>
        <li>
          <Em>Entire agreement.</Em> These Terms, together with our Privacy Policy and any details confirmed at the time
          of booking, form the entire agreement between you and Genie about our services.
        </li>
        <li>
          <Em>Severability.</Em> If any part of these Terms is found invalid or unenforceable, the rest remains in full
          effect.
        </li>
        <li>
          <Em>No waiver.</Em> If we do not enforce a provision straight away, we do not give up our right to enforce it
          later.
        </li>
        <li>
          <Em>Assignment.</Em> You may not transfer your rights under these Terms. We may transfer ours to a successor
          business.
        </li>
        <li>
          <Em>Communication.</Em> You agree that we may contact you by email and phone about your account, bookings and
          transactions.
        </li>
      </LegalList>
    ),
  },
  {
    id: 'grievance',
    title: 'Grievance redressal and contact',
    content: (
      <>
        <p>
          If you have a question, complaint or concern about these Terms or a transaction, please contact our support and
          grievance team:
        </p>
        <LegalContactCard />
        <LegalList>
          <li>
            We acknowledge every grievance <Em>within 48 hours</Em> and resolve it <Em>within 30 days</Em> of receiving
            it.
          </li>
          <li>
            To help us respond faster, include your request number (shown on the{' '}
            <InlineLink to="/track">Track Order</InlineLink> page) and the email address or phone number linked to your
            account.
          </li>
        </LegalList>
      </>
    ),
  },
];

export const TermsPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Terms & Conditions | Genie';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <LegalLayout
      icon={Scale}
      title="Terms & Conditions"
      summary="These terms explain how selling your used device to Genie works — from the indicative online quote and free doorstep pickup to the physical inspection, the final offer and getting paid. Please read them carefully: by using our website or booking a pickup, you agree to them."
      sections={sections}
      crossLink={{
        to: '/privacy',
        title: 'Privacy Policy',
        description: 'How we collect, use, share and protect your personal data, and the rights you have over it.',
      }}
    />
  );
};
