import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Send email when appointment confirmed
export const sendAppointmentConfirmedEmail = async (
  patientEmail,
  doctorName,
  date
) => {
  try {
    await transporter.sendMail({
      from: `"DentaFlow" <${process.env.MAIL_USER}>`,
      to: patientEmail,
      subject: "✅ Your appointment is confirmed - DentaFlow",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmed</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f8fafc;
            }
            .container { 
              background: white; 
              border-radius: 12px; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              overflow: hidden;
              margin: 20px;
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
              color: white; 
              padding: 30px; 
              text-align: center;
            }
            .header h1 { 
              margin: 0; 
              font-size: 24px; 
              font-weight: 600;
            }
            .emoji { 
              font-size: 48px; 
              margin: 10px 0;
            }
            .content { 
              padding: 30px;
            }
            .appointment-card {
              background: #f1f5f9;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 12px 0;
              padding-bottom: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #475569;
            }
            .value {
              color: #1e293b;
              font-weight: 500;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
            }
            .btn {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🦷</div>
              <h1>Appointment Confirmed!</h1>
              <p>Your dental appointment has been successfully confirmed</p>
            </div>
            
            <div class="content">
              <div class="appointment-card">
                <h3 style="margin-top: 0; color: #1e293b;"> Appointment Details</h3>
                
                <div class="detail-row">
                  <span class="label"> Doctor: </span>
                  <span class="value">${doctorName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label"> Date: </span>
                  <span class="value">${new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">⏰ Time: </span>
                  <span class="value">${new Date(date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              
              <h3>What's next?</h3>
              <ul style="color: #475569; line-height: 1.8;">
                <li>Please arrive 15 minutes early for check-in</li>
                <li>Bring a valid ID and insurance card</li>
                <li>If you need to reschedule, contact us at least 24 hours in advance</li>
              </ul>
              
              <h3>📞 Need to contact us?</h3>
              <p style="color: #475569;">If you have any questions or need to make changes to your appointment, please don't hesitate to reach out to our team.</p>
            </div>
            
            <div class="footer">
              <p><strong>DentaFlow Dental Care</strong></p>
              <p>Taking care of your smile, one appointment at a time 😊</p>
              <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("📧 Email sent successfully");
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
};