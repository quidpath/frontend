import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = {
      to: 'quidpath@gmail.com',
      subject: `New Lead from QuidPath Contact Form - ${body.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #43A047, #2E7D32); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #2E7D32; margin-top: 0;">Contact Information</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${body.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                  <a href="mailto:${body.email}" style="color: #43A047;">${body.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                  <a href="tel:${body.phone}" style="color: #43A047;">${body.phone}</a>
                </td>
              </tr>
              ${body.company ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Company:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${body.company}</td>
              </tr>
              ` : ''}
            </table>
            
            <h3 style="color: #2E7D32; margin-top: 30px;">Message</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #43A047;">
              <p style="margin: 0; white-space: pre-wrap;">${body.message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #2E7D32;">
                <strong>Quick Actions:</strong><br>
                • Reply via email: <a href="mailto:${body.email}" style="color: #43A047;">${body.email}</a><br>
                • Call: <a href="tel:${body.phone}" style="color: #43A047;">${body.phone}</a><br>
                • WhatsApp: <a href="https://wa.me/${body.phone.replace(/[^0-9]/g, '')}" style="color: #43A047;">Send WhatsApp</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This lead was submitted via the QuidPath contact form</p>
            <p>Timestamp: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Information:
- Name: ${body.name}
- Email: ${body.email}
- Phone: ${body.phone}
${body.company ? `- Company: ${body.company}` : ''}

Message:
${body.message}

---
Timestamp: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
      `.trim(),
    };

    // Send email using your backend API
    const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
    
    const response = await fetch(`${API_URL}/api/support/send-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      // If backend email service fails, log the error but still return success
      // This ensures the user gets a good experience even if email fails
      console.error('Failed to send email via backend:', await response.text());
      
      // You could also log this to a database or monitoring service
      // For now, we'll just return success to the user
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }
}
