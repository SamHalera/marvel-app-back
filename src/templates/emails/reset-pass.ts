import uid2 from "uid2";

export function resetPasswordtemplate(token: string) {
  const url = process.env.FRONT_URL;
  console.log("user token=>", token);

  return `<mjml lang="en>
  <mj-head>
    <mj-font name="Roboto" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" />
    <mj-attributes>
      <mj-text font-family="Roboto" font-size="16px" line-height="26px" color="#4c5862"  padding-bottom="0.5px" />
      <mj-button background-color="#ed1d24" font-size="16px" color="#ffffff" 
          font-family="Roboto" text-transform="capitalize" height="35px" width="150px" padding-top="30px" padding-bottom="30px" />
      <mj-class name="head-text" font-size="48px" text-transform="capitalize" padding-bottom="30px" line-height="48px"/>
      <mj-class name="social-bg"  background-color="#A1A0A0"/>
    </mj-attributes>
  </mj-head>
  <mj-body width="800px">
    <!-- Header section -->
    <mj-section background-color="#ffffff">
      <mj-column>
        <!-- Company logo image -->
        <mj-image width="150px" src="https://res.cloudinary.com/devwm/image/upload/v1702041211/Articles/MJML%20email/c9cuclgaag3razkqa8eg.png" />
        <!-- Divider -->
        <mj-divider border-color="#ed1d24"></mj-divider>
      </mj-column>
    </mj-section>

    <!-- Content section -->
    <mj-wrapper padding-top="0" padding-bottom="0" css-class="body-section">
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
        <mj-column width="100%">
          <!-- Introductory text -->
          <mj-text font-weight="bold" padding-bottom="15px">
            Hello,
          </mj-text>

          <!-- Banner image -->
          

          <!-- Content text -->
          <mj-text>
            👍🏻 In order to reset your passord click on the likn below and follow the instructions.
          </mj-text>

        </mj-column>
        <mj-column>
         <!-- Button -->
         <mj-text>
         
         <a
         background-color="#ed1d24" font-size="16px" color="#ffffff
         padding="15px"
         href="${url}/reset-password?token=${token}">
           reset password
         </a>
         </mj-text>

        </mj-column>
        <mj-column>
         <mj-text>
            Thank you 
            <br /><br />
            Best regards,
          </mj-text>

        </mj-column>

      </mj-section>

      

      <!-- Footer section -->
      <mj-section>
        <mj-column width="100%" padding="0">
          <!-- Social icons -->
          <mj-social font-size="15px" icon-size="30px" mode="horizontal" padding="0" align="center">
            <mj-social-element name="facebook" href="#" mj-class="social-bg"></mj-social-element>
            <mj-social-element name="google" href="#" mj-class="social-bg"></mj-social-element>
            <mj-social-element name="linkedin" href="#" mj-class="social-bg"></mj-social-element>
          </mj-social>

          <!-- Contact information -->
          <mj-text color="#445566" font-size="11px" align="center" line-height="16px">
            If you have any questions regarding this email or any related queries, you can contact us at <a href="contact-themarvelous@gmail.com">contact-themarvelous@gmail.com</a>
          </mj-text>

          <!-- Copyright -->
          <mj-text color="#445566" font-size="11px" align="center" line-height="16px">
            &copy; TheMarvelous, All Rights Reserved.
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>

`;
}
