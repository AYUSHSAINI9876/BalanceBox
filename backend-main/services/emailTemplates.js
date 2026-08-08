// services/emailTemplates.js
// Inline styles only and a table-based shell: email clients strip <style> blocks
// and have poor flex/grid support.

const BRAND = {
  blue: '#2563eb',
  deep: '#1746a2',
  ink: '#1d3557',
  muted: '#64748b',
  border: '#e3edfa',
  wash: '#f7faff',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function otpEmail({ code, minutes, appName = 'BalanceBox' }) {
  const safeCode = escapeHtml(code);
  const safeApp = escapeHtml(appName);

  // Spaced digits render clearly and discourage clients from auto-linking the
  // code as a phone number.
  const spacedCode = safeCode.split('').join('&#8202;');

  const subject = `${safeCode} is your ${safeApp} verification code`;

  const text = [
    `${appName} verification`,
    '',
    `Your verification code is: ${code}`,
    '',
    `This code expires in ${minutes} minutes.`,
    'If you did not request it, you can safely ignore this email.',
    '',
    `— The ${appName} team`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.wash};">
  <!-- Preheader: shown in the inbox preview, hidden in the body -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your ${safeApp} code is ${safeCode}. It expires in ${minutes} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.wash};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:520px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <tr>
            <td align="center" style="padding:32px 32px 8px 32px;">
              <div style="font-size:24px;font-weight:800;color:${BRAND.deep};letter-spacing:0.3px;">
                ${safeApp}
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:8px 32px 0 32px;">
              <h1 style="margin:0;font-size:20px;line-height:1.4;font-weight:700;color:${BRAND.ink};">
                Verify your email
              </h1>
              <p style="margin:10px 0 0 0;font-size:15px;line-height:1.6;color:${BRAND.muted};">
                Enter this code to finish creating your ${safeApp} account.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px;">
              <div style="background:${BRAND.wash};border:1px solid ${BRAND.border};border-radius:12px;padding:20px 24px;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:${BRAND.blue};">
                  ${spacedCode}
                </div>
              </div>
              <p style="margin:14px 0 0 0;font-size:13px;color:${BRAND.muted};">
                This code expires in <strong style="color:${BRAND.ink};">${minutes} minutes</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:${BRAND.border};"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 28px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND.muted};">
                Didn't request this? You can safely ignore this email — no account
                will be created without the code above.
              </p>
              <p style="margin:14px 0 0 0;font-size:13px;line-height:1.7;color:${BRAND.muted};">
                Never share this code. ${safeApp} will never ask you for it.
              </p>
            </td>
          </tr>
        </table>

        <p style="max-width:520px;margin:18px auto 0 auto;font-size:12px;color:${BRAND.muted};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          Sent by ${safeApp} · This is an automated message, please don't reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

module.exports = { otpEmail };
