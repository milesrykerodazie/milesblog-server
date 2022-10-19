import nodemailer from 'nodemailer';

const service: string = process.env.SERVICE!;
const authmail: string = process.env.MAIL!;
const authpass: string = process.env.EPASSWORD!;

// generating OTP for user verification
export const generateOTP = () => {
   let otp = '';
   for (let i = 0; i <= 5; i++) {
      const randomValue = Math.round(
         Math.random() * Number(process.env.OPT_VARIANT),
      );
      otp += randomValue;
   }
   return otp;
};

export const mailSending = () => {
   const transport = nodemailer.createTransport({
      service: service,
      auth: {
         user: authmail,
         pass: authpass,
      },
   });
   return transport;
};

export const emailVerificationTemplate = (code: string) => {
   return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <style>
          .container{
              max-width:50%;
              margin-left: auto;
              margin-right: auto;
              margin-top: 20px;
               background-color:white; 
               border-radius:10px;
          }
         
          @media screen and (min-width: 480px) {
    .container {max-width: 100%; margin-top: 50px;}
    
  }
       </style>
      <title>Email Verification Request</title>
    </head>
    <body>
    <div class="container">
      <h2 style="color:#3563E9;
      padding-top: 20px;
      text-align: center;
      font-size: 40px;
      font-weight: 600;">Welcome To Miles Blog</h2>
      <div style="padding:5px 35px; margin-top: -30px;">
        <div>
        <p style="font-size: 22px; color:#3563E9; padding:5px; text-align: center;">We're glad to have you on board.Take your time to purchase any of our reliable products.</p>
        <p style="font-size: 18px; color:#3563E9; text-align: center; font-weight: 600;">Use this code below to verify your email address. </p>
        <p style="font-weight:600; color:black; letter-spacing: 0.05em; font-size: 25px; text-align: center;">${code}</p>
        <P style="font-size: 16px; color:#3563E9; text-align: center;">Thank you for choosing Miles Ecommerce.</P>
    </div>
    </div>
    </body>
    </div>
    </html>
 
 `;
};

export const verificationSuccessTemplate = () => {
   return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <style>
          .container{
              max-width:50%;
              margin-left: auto;
              margin-right: auto;
              margin-top: 20px;
               background-color:white; 
               border-radius:10px;
          }
         
          @media screen and (min-width: 480px) {
    .container {max-width: 100%; margin-top: 50px;}
    
  }
       </style>
      <title>Verification Success</title>
    </head>
    <body>
    <div class="container" >
      <h2 style="color:#3563E9;
      padding-top: 20px;
      text-align: center;
      font-size: 40px;
      font-weight: 600;">Welcome To Miles Blog Sample</h2>
      <div style="padding:5px 35px; margin-top: -30px;">
        <div>
        <p style="font-weight: 600; font-size: 22px; color:#3563E9; padding:5px; text-align: center;">Your Email verification was SUCCESSFUL.</p>
        <div>
          <p style="font-size: 18px; color:#3563E9; text-align: center; font-weight: 600;">You can now explore <b>Miles Ecommerce</b>. </p>
          <P style="font-size: 16px; color:#3563E9; text-align: center;">Thank you for choosing Miles Blog Sample.</P>
        </div>
        
    </div>
    </div>
    </body>
    </div>
    </html>
 
 `;
};

export const passwordResetTemplate = (link: string) => {
   return `
   <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <style>
        .container{
            max-width:50%;
            margin-left: auto;
            margin-right: auto;
            margin-top: 20px;
             background-color:white; 
             border-radius:10px;
        }
       
        @media screen and (min-width: 480px) {
  .container {max-width: 100%; margin-top: 50px;}
  
}
     </style>
    <title>Reset Password Request</title>
  </head>
  <body>
  <div class="container" >
    <h2 style="color:#3563E9;
    padding-top: 20px;
    text-align: center;
    font-size: 40px;
    font-weight: 600;">Welcome To Miles Blog Sample</h2>
    <div style="padding:5px 35px; margin-top: -30px;">
      <div>
      <p style="font-weight: 600; font-size: 22px; color:#3563E9; padding:5px; text-align: center;">Click the reset button below to reset your password.</p>
      <div>
        <button style="font-size: 20px; font-weight: 600; width: 100%; border-radius: 5px; outline: none; border: none; padding: 10px 0;">
        <a href="${link}" style="color: #3563E9; letter-spacing: 0.1em;">Reset Password </a>
    </button>
        <P style="font-size: 16px; color:#3563E9; text-align: center;">Thank you for choosing Miles Blog Sample.</P>
      </div>
      
  </div>
  </div>
  </body>
  </div>
  </html>
  
  `;
};

export const passwordResetSuccessTemplate = () => {
   return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <style>
       .container{
           max-width:50%;
           margin-left: auto;
           margin-right: auto;
           margin-top: 20px;
            background-color:white; 
            border-radius:10px;
       }
      
       @media screen and (min-width: 480px) {
 .container {max-width: 100%; margin-top: 50px;}
 
}
    </style>
    <title>Password Reset Success</title>
  </head>
  <body>
  <div class="container" >
    <h2 style="color:#3563E9;
    padding-top: 20px;
    text-align: center;
    font-size: 40px;
    font-weight: 600;">Welcome To Miles Blog Sample</h2>
    <div style="padding:5px 35px; margin-top: -30px;">
      <div>
      <p style="font-weight: 600; font-size: 22px; color:#3563E9; padding:5px; text-align: center;">Your password reset was SUCCESSFUL.</p>
      <div>
        <p style="font-size: 18px; color:#3563E9; text-align: center; font-weight: 600;">You can now login with your new password. </p>
        <P style="font-size: 16px; color:#3563E9; text-align: center;">Thank you for choosing Miles Blog Sample.</P>
      </div>
      
  </div>
  </div>
  </body>
  </div>
  </html>
 
 `;
};
