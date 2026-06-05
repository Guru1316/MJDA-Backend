const Application = require('../Models/ApplicationModel');
const sendEmail = require('../Utils/sendEmail');

// @desc    Submit new application (Protected - Students)
const createApplication = async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, user: req.user._id });
    res.status(201).json(app);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// @desc    Get logged in user's applications (Protected - Students) -> For Home.tsx
const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user._id });
    res.json(apps);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all applications (Admin Only) -> For Admin.tsx
const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({}).sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update application status & Send Email (Admin Only)
const updateAppStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    app.status = req.body.status;
    await app.save();

    // --- AUTOMATED EMAIL LOGIC ---
    if (req.body.status === 'Approved' || req.body.status === 'Rejected') {
      const subject = `Your MJ Dance Academy Application Status: ${req.body.status}`;
      
      let message = '';
      if (req.body.status === 'Approved') {
        message = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #C9A84C;">Congratulations, ${app.name}! 🎉</h2>
            <p>We are absolutely thrilled to let you know that your application for the <strong>${app.courseName}</strong> course has been <strong>APPROVED</strong>!</p>
            <p>Please log in to your dashboard to view your updated status, schedule, and next steps.</p>
            <br/>
            <p>Welcome to the MJ Dance Academy family!</p>
            <p>Keep dancing,<br/><strong>The MJ Dance Team</strong></p>
          </div>
        `;
      } else if (req.body.status === 'Rejected') {
        message = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #d9534f;">Hello ${app.name},</h2>
            <p>Thank you for applying to the <strong>${app.courseName}</strong> course.</p>
            <p>At this time, we are unable to approve your application. This may be due to class capacity limits or prerequisites required for this specific level.</p>
            <p>Don't be discouraged! We highly encourage you to apply for other available courses that fit your schedule.</p>
            <br/>
            <p>Best regards,<br/><strong>The MJ Dance Team</strong></p>
          </div>
        `;
      }

      try {
        await sendEmail({
          email: app.email,
          subject: subject,
          message: message
        });
        console.log(`✅ Automated Email sent to ${app.email}`);
      } catch (emailError) {
        console.error('❌ Email could not be sent:', emailError);
        // We log the error but don't fail the entire API request just because the email bounced.
      }
    }

    res.json(app);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { createApplication, getMyApplications, getApplications, updateAppStatus };