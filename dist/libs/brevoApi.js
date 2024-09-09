"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brevoSendEmail = void 0;
const brevoApiKey = () => {
    if (!process.env.BREVO_API_KEY) {
        console.error("BREVO API KEY IS MISSING");
        return "BREVO API KEY IS MISSING";
    }
    return process.env.BREVO_API_KEY;
};
const brevoSendEmail = (params, to, templateId) => __awaiter(void 0, void 0, void 0, function* () {
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
        const sendEmail = yield fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify(body),
        }).then((res) => res.json());
        return sendEmail;
    }
    catch (error) {
        console.error(error);
    }
});
exports.brevoSendEmail = brevoSendEmail;
