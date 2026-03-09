const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, otp) => {
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; border: 1px solid #00f3ff;">
            <h2 style="color: #00f3ff; text-align: center;">Email Verification Code</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Your verification code is:</p>
            <div style="background-color: #1a1a1a; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #ff00ff; border: 1px solid #ff00ff;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #aaaaaa; margin-top: 20px;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Akbar<akbar@wbee.site>', // Update with your verified Resend domain
            to: [email],
            subject: 'Verify Mail Services',
            html: htmlTemplate
        });
        
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendVerificationEmail };