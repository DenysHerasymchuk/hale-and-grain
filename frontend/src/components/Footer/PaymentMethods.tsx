import AmexIcon from '@/components/foundations/payment-icons/amex-icon'
import ApplePayIcon from '@/components/foundations/payment-icons/apple-pay-icon'
import BancontactIcon from '@/components/foundations/payment-icons/bancontact-icon'
import GooglePayIcon from '@/components/foundations/payment-icons/google-pay-icon'
import IdealIcon from '@/components/foundations/payment-icons/ideal-icon'
import MastercardIcon from '@/components/foundations/payment-icons/mastercard-icon'
import PayPalIcon from '@/components/foundations/payment-icons/paypal-icon'
import VisaIcon from '@/components/foundations/payment-icons/visa-icon'

const methods = [
  { name: 'iDEAL', Icon: IdealIcon },
  { name: 'Bancontact', Icon: BancontactIcon },
  { name: 'Visa', Icon: VisaIcon },
  { name: 'Mastercard', Icon: MastercardIcon },
  { name: 'American Express', Icon: AmexIcon },
  { name: 'PayPal', Icon: PayPalIcon },
  { name: 'Apple Pay', Icon: ApplePayIcon },
  { name: 'Google Pay', Icon: GooglePayIcon },
]

export function PaymentMethods() {
  return (
    <ul aria-label="Payment methods" className="flex flex-wrap items-center gap-1.5 lg:justify-center">
      {methods.map(({ name, Icon }) => (
        <li key={name}>
          <Icon role="img" aria-label={name} className="h-6 w-auto" />
        </li>
      ))}
    </ul>
  )
}
