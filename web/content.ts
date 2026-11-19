// All the page's copy in one place (SPEC 4). The same words are in web/index.html, so the page
// reads with JavaScript off; web/structure.test.ts checks the two match.
// Strata is fictional. Prices and claims change only with the person's approval (SPEC rule 7).

export interface Spec {
  label: string;
  value: string;
}

export interface Module {
  id: "lights" | "climate" | "security" | "energy";
  name: string;
  story: string;
  specs: [Spec, Spec, Spec];
}

export interface Bundle {
  name: "Starter" | "Home" | "Complete";
  price: string;
  includes: Module["id"][];
}

export interface Question {
  question: string;
  answer: string;
}

export const content = {
  status: "draft" as "draft" | "approved",
  hero: {
    headline: "One hub. Every room.",
    lede: "Strata is a smart home hub built from modules that snap together. Start with light. Add climate, security and energy when you're ready.",
  },
  inside: "Scroll to look inside",
  modules: [
    {
      id: "lights",
      name: "Lights",
      story:
        "Turns the lights on as you walk in and dims them as the evening comes. Set a scene once and every room follows it.",
      specs: [
        { label: "Lights per hub", value: "Up to 50" },
        { label: "Works with", value: "Matter and Zigbee" },
        { label: "Response time", value: "Under 100 ms" },
      ],
    },
    {
      id: "climate",
      name: "Climate",
      story:
        "Learns when you're home and keeps each room at the temperature you set, within 0.5 °C. No schedules to program.",
      specs: [
        { label: "Temperature range", value: "5 to 35 °C" },
        { label: "Humidity sensing", value: "0 to 100%" },
        { label: "Power", value: "Battery-free, from the hub" },
      ],
    },
    {
      id: "security",
      name: "Security",
      story:
        "Knows when a door opens or the house goes quiet when it shouldn't. Alerts reach your phone in seconds, and recordings stay at home.",
      specs: [
        { label: "Door and window sensors", value: "Up to 30" },
        { label: "Alert time", value: "Under 3 seconds" },
        { label: "Video storage", value: "64 GB, on the hub" },
      ],
    },
    {
      id: "energy",
      name: "Energy",
      story:
        "Shows what each circuit uses as it happens, and runs the big appliances when power is cheaper.",
      specs: [
        { label: "Circuits measured", value: "Up to 16" },
        { label: "Reading interval", value: "Every 2 seconds" },
        { label: "Tariff aware", value: "Yes" },
      ],
    },
  ] satisfies Module[],
  reassemble: "Start with one module. Add the rest when you're ready.",
  bundles: [
    { name: "Starter", price: "$199", includes: ["lights"] },
    { name: "Home", price: "$349", includes: ["lights", "climate", "security"] },
    { name: "Complete", price: "$499", includes: ["lights", "climate", "security", "energy"] },
  ] satisfies Bundle[],
  register: {
    title: "Hear when Strata launches",
    intro: "One email at launch. Nothing else.",
    noScript: "Turn on JavaScript to register interest.",
  },
  privacy:
    "We only use your email to tell you about the Strata launch. Nothing is sent in this demo.",
  faq: [
    {
      question: "Is there a subscription?",
      answer: "No. Everything works without a monthly fee.",
    },
    {
      question: "What does Strata work with?",
      answer:
        "Lights and plugs that use Matter or Zigbee, and the four Strata modules. The app makes setup easier, but the hub runs without it.",
    },
    {
      question: "What happens to my data?",
      answer:
        "It stays on the hub in your home. Nothing goes to the cloud unless you turn on remote access.",
    },
    {
      question: "When does it ship?",
      answer:
        "Strata is a fictional product made for a design pilot, so there is no ship date. Registering shows how the launch page works.",
    },
    {
      question: "Can I return it?",
      answer: "Yes, within 30 days, in its box, for a full refund.",
    },
    {
      question: "How is it powered?",
      answer:
        "The hub plugs into a wall socket. The modules take their power from the hub, so there are no batteries to change.",
    },
  ] satisfies Question[],
  footer: "Strata is a fictional product made for a design pilot.",
};
