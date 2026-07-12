import emailjs from '@emailjs/browser';

const SERVICE_ID = () => import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = () => import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = () => import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

/**
 * Sends a generic system email via EmailJS.
 * Sends all common variable names so it works with any standard EmailJS template.
 * Common template variables: {{to_name}}, {{to_email}}, {{from_name}}, {{subject}}, {{message}}
 */
export const sendSystemEmail = async (
  toEmail: string,
  subject: string,
  message: string,
  actionName: string = 'System Update'
): Promise<boolean> => {
  const serviceId = SERVICE_ID();
  const templateId = TEMPLATE_ID();
  const publicKey = PUBLIC_KEY();

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS is not fully configured in .env. Skipping real email send.');
    return false;
  }

  // We send ALL common EmailJS template variable names so the template
  // works regardless of what placeholder names are used in the dashboard.
  const templateParams: Record<string, string> = {
    // Standard EmailJS default template variables
    to_email:    toEmail,
    to_name:     toEmail.split('@')[0],       // derive name from email
    from_name:   'TransitOps System',
    from_email:  'noreply@transitops.com',
    reply_to:    'noreply@transitops.com',
    subject:     subject,
    message:     message,
    // Extras in case template uses these names
    action_name: actionName,
    email:       toEmail,
    name:        toEmail.split('@')[0],
    user_email:  toEmail,
    user_name:   toEmail.split('@')[0],
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return response.status === 200;
  } catch (error: unknown) {
    // Log the full error so we can see the exact mismatch
    console.error('EmailJS Error (raw):', JSON.stringify(error, null, 2));
    if (error && typeof error === 'object' && 'text' in error) {
      console.error('EmailJS Error text:', (error as { text?: string }).text);
    }
    return false;
  }
};

/**
 * Generates a cryptographically-safe 6-digit OTP.
 */
export const generateOtp = (): string => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1_000_000).padStart(6, '0');
};

/**
 * Sends a one-time password (OTP) to the specified email.
 */
export const sendOtpEmail = async (toEmail: string, otp: string): Promise<boolean> => {
  const subject = 'TransitOps: Your One-Time Login Code';
  const message = `Your secure one-time login code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.\n\nIf you did not request this, please contact your Fleet Manager immediately.`;
  return sendSystemEmail(toEmail, subject, message, 'OTP Authentication');
};
