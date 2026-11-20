// The register-interest form (SPEC 4.5, 6 and 9; rules 3 and 4). It checks the fields and shows
// a confirmation. Nothing is sent, saved or logged in the pilot.

const EMAIL_ERROR = "Enter an email address, like name@example.com";
const CONSENT_ERROR = "Tick the box to agree we can email you";
const THANKS = "Thanks. We'll email you when Strata launches.";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(field: HTMLInputElement, message: HTMLElement, text: string | null): void {
  if (text) {
    const span = message.querySelector("span");
    if (span) span.textContent = text;
    message.hidden = false;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", message.id);
  } else {
    const span = message.querySelector("span");
    if (span) span.textContent = "";
    message.hidden = true;
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }
}

export function setUpForm(form: HTMLFormElement): void {
  const email = form.querySelector<HTMLInputElement>("#email");
  const consent = form.querySelector<HTMLInputElement>("#consent");
  const emailError = form.querySelector<HTMLElement>("#email-error");
  const consentError = form.querySelector<HTMLElement>("#consent-error");
  const status = form.querySelector<HTMLElement>("[role=status]");
  const button = form.querySelector<HTMLButtonElement>("button");
  if (!email || !consent || !emailError || !consentError || !status || !button) return;
  form.querySelector("fieldset")?.removeAttribute("disabled"); // JavaScript is on: the form can be used

  const check = () => {
    status.textContent = "";
    const value = email.value.trim();
    const emailOk = value.length > 0 && value.length <= 254 && EMAIL.test(value);
    setError(email, emailError, emailOk ? null : EMAIL_ERROR);
    setError(consent, consentError, consent.checked ? null : CONSENT_ERROR);
    if (!emailOk) return email.focus();
    if (!consent.checked) return consent.focus();
    status.textContent = THANKS; // rule 4: nothing is sent in the pilot
  };

  button.addEventListener("click", check);
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Enter in the email field must never send the form
    check();
  });
}
