import crypto from "node:crypto";

import { sendActivationEmail } from "./sendEmail.js";

import config from "../config.js";

const activations = [];


/* 
 "type" argument:
    0 - account registration
    1 - changing email address
*/

export default async (email, type, details) => {

    const sorted = activations.filter(item => item.email == email).sort((a, b) => a.sentDate - b.sentDate);

    if((sorted.length > 1) && (new Date() - sorted[0].sentDate < config.activationEmails.timeBetweenSending)) return "You must wait a while before performing this action";

    const token = crypto.randomBytes(32).toString("hex");
    const activationUrl = `${config.appBaseUrl}/activate?token=${token}`;

    const sendEmail = await sendActivationEmail(email, activationUrl, type);
    if(!sendEmail) return "Failed to send email";

    activations.push({
        token, email, type, details,
        sentDate: new Date()
    });

    return "SUCCESS";

}

setInterval(() => {
    for(const i in activations) {
        if(new Date() - activations[i].sentDate >= config.activationEmails.tokenLifetime)
            delete activations[i];
    }

}, config.activationEmails.scheduleInterval);

export { activations }