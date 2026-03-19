# Email Setup Instructions

## Current Status: DEMO MODE
The email system is currently in demo mode - it logs emails to console but doesn't actually send them.

## To Enable Real Email Sending:

### Option 1: Gmail SMTP (Recommended for Small Volume)

1. **Install Nodemailer:**
   ```bash
   npm install nodemailer @types/nodemailer
   ```

2. **Create Gmail App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"
   - Save the password

3. **Environment Variables:**
   Create `.env.local` file:
   ```env
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-digit-app-password
   ```

4. **Update API Route:**
   Uncomment and configure the Nodemailer section in:
   `src/app/api/send-email/route.ts`

### Option 2: SendGrid (Recommended for Production)

1. **Install SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Get SendGrid API Key:**
   - Create SendGrid account
   - Generate API key

3. **Environment Variables:**
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Option 3: Other Providers
- Mailgun
- Amazon SES
- Postmark
- Resend

## Email Templates
The current email format includes:
- Customer information
- Order details
- Product list with quantities
- Total amount
- Order timestamp
- Payment method (COD)

## Testing
1. Submit test order
2. Check server console for email logs
3. Configure real email service
4. Test with real email delivery

## Production Checklist
- [ ] Choose email provider
- [ ] Configure API keys
- [ ] Set up proper domain authentication
- [ ] Test email delivery
- [ ] Configure rate limiting
- [ ] Set up monitoring/error tracking