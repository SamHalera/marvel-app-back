const brevoApiKey = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO API KEY IS MISSING");
    return "BREVO API KEY IS MISSING";
  }
  return process.env.BREVO_API_KEY;
};

export const brevoSendEmail = async (
  params: {
    url: string;
    token: string;
  },
  to: {
    email: string;
  }[],
  templateId: number
) => {
  const body = {
    // sender: {
    //   name: "The Marvelous",
    //   email: "noreply.themarvelous@gmail.com",
    // },
    to,
    templateId,
    params,
  };

  try {
    const apiKey = brevoApiKey();

    const sendEmail = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());

    return sendEmail;
  } catch (error) {
    console.error(error);
  }
};
