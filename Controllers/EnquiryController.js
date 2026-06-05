const Enquiry = require('../Models/EnquiryModel');
const sendEmail = require('../Utils/sendEmail'); // <--- Import your email utility!

// @desc    Submit a contact form (Public)
const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Get all enquiries (Admin Only)
const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Reply to enquiry & mark as replied (Admin Only)
const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    const { replyMessage } = req.body;

    // --- AUTOMATED EMAIL LOGIC ---
    if (replyMessage) {
      const subject = `Re: ${enquiry.subject} - MJ Dance Academy`;
      
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #C9A84C;">Hello ${enquiry.name},</h2>
          <p>Thank you for reaching out to MJ Dance Academy.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #C9A84C; margin-bottom: 20px; border-radius: 4px;">
            <p style="white-space: pre-wrap; margin: 0;">${replyMessage}</p>
          </div>
          
          <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; pt-2 mt-4;">
            <strong>Your Original Message:</strong><br/>
            <i>"${enquiry.message}"</i>
          </p>
          <br/>
          <p>Best regards,<br/><strong>The MJ Dance Team</strong></p>
        </div>
      `;

      try {
        await sendEmail({
          email: enquiry.email,
          subject: subject,
          message: htmlMessage
        });
        console.log(`✅ Reply email sent to ${enquiry.email}`);
      } catch (emailError) {
        console.error('❌ Email could not be sent:', emailError);
      }
    }

    enquiry.status = 'Replied';
    await enquiry.save();
    res.json(enquiry);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { createEnquiry, getEnquiries, updateEnquiryStatus };