/** Tiny dictionary-based i18n for the farmer portal. */

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  "app.name": "Smart Farmer",
  "app.tagline": "Procurement",
  "welcome.eyebrow": "Farmer portal",
  "welcome.title1": "Know before",
  "welcome.title2": "you go.",
  "welcome.body":
    "Book your procurement slot, carry one token, and watch the queue move in real time. No waiting all day at the centre.",
  "welcome.cta": "Get started",
  "welcome.signin": "I already have an account",
  "language.title": "Choose your language",
  "language.body": "Every screen after this will use the language you pick. You can change it any time.",
  "language.continue": "Continue",
  "register.title": "Create your farmer profile",
  "register.body": "We only need a few details to issue tokens in your name.",
  "register.name": "Full name",
  "register.mobile": "Mobile number",
  "register.village": "Village / location",
  "register.optional": "optional",
  "register.consent": "I agree to the terms of use and privacy policy.",
  "register.submit": "Continue to OTP",
  "login.title": "Sign in with your mobile",
  "login.body": "We will send a 6-digit code to your phone.",
  "login.send": "Send OTP",
  "login.otpTitle": "Enter the code",
  "login.otpBody": "Code sent to",
  "login.verify": "Verify & continue",
  "login.resend": "Resend code",
  "login.change": "Change number",
  "nav.home": "My farm day",
  "nav.centres": "Find a centre",
  "nav.book": "Book a token",
  "nav.token": "My token",
  "nav.queue": "Live queue",
  "nav.procurement": "Procurement",
  "nav.payment": "Payment",
  "nav.notifications": "Notifications",
  "nav.history": "Booking history",
  "nav.more": "More & help",
  "nav.profile": "My profile",
  "common.confirm": "Confirm",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.next": "Next",
  "common.save": "Save changes",
};

const hi: Dict = {
  "welcome.eyebrow": "किसान पोर्टल",
  "welcome.title1": "जाने से पहले",
  "welcome.title2": "जान लें।",
  "welcome.body":
    "अपनी खरीद स्लॉट बुक करें, एक टोकन लेकर जाएँ और कतार को लाइव देखें। केंद्र पर दिन भर इंतज़ार नहीं।",
  "welcome.cta": "शुरू करें",
  "welcome.signin": "मेरा खाता पहले से है",
  "language.title": "अपनी भाषा चुनें",
  "language.body": "इसके बाद हर स्क्रीन आपकी चुनी भाषा में होगी। आप इसे कभी भी बदल सकते हैं।",
  "language.continue": "आगे बढ़ें",
  "register.title": "अपना किसान प्रोफ़ाइल बनाएँ",
  "register.body": "टोकन जारी करने के लिए हमें कुछ ही जानकारी चाहिए।",
  "register.name": "पूरा नाम",
  "register.mobile": "मोबाइल नंबर",
  "register.village": "गाँव / स्थान",
  "register.consent": "मैं नियम और गोपनीयता नीति से सहमत हूँ।",
  "register.submit": "ओटीपी पर जाएँ",
  "login.title": "मोबाइल से साइन इन करें",
  "login.body": "हम आपके फ़ोन पर 6 अंकों का कोड भेजेंगे।",
  "login.send": "ओटीपी भेजें",
  "login.otpTitle": "कोड दर्ज करें",
  "login.otpBody": "कोड भेजा गया",
  "login.verify": "सत्यापित करें",
  "nav.home": "मेरा दिन",
  "nav.centres": "केंद्र खोजें",
  "nav.book": "टोकन बुक करें",
  "nav.token": "मेरा टोकन",
  "nav.queue": "लाइव कतार",
  "nav.procurement": "खरीद",
  "nav.payment": "भुगतान",
  "nav.notifications": "सूचनाएँ",
  "nav.history": "बुकिंग इतिहास",
  "nav.more": "अधिक और मदद",
  "nav.profile": "प्रोफ़ाइल",
};

const te: Dict = {
  "welcome.eyebrow": "రైతు పోర్టల్",
  "welcome.title1": "వెళ్లే ముందు",
  "welcome.title2": "తెలుసుకోండి.",
  "welcome.body":
    "మీ కొనుగోలు స్లాట్ బుక్ చేసుకోండి, ఒకే టోకెన్ తీసుకెళ్లండి, క్యూను లైవ్‌లో చూడండి.",
  "welcome.cta": "ప్రారంభించండి",
  "welcome.signin": "నాకు ఖాతా ఉంది",
  "language.title": "మీ భాషను ఎంచుకోండి",
  "language.continue": "కొనసాగించు",
  "nav.home": "నా రోజు",
  "nav.book": "టోకెన్ బుక్",
  "nav.token": "నా టోకెన్",
  "nav.queue": "లైవ్ క్యూ",
  "nav.payment": "చెల్లింపు",
};

const mr: Dict = {
  "welcome.eyebrow": "शेतकरी पोर्टल",
  "welcome.title1": "जाण्यापूर्वी",
  "welcome.title2": "माहिती घ्या.",
  "welcome.cta": "सुरू करा",
  "language.title": "तुमची भाषा निवडा",
  "language.continue": "पुढे",
  "nav.home": "माझा दिवस",
  "nav.token": "माझे टोकन",
};

const DICTS: Record<LanguageCode, Dict> = { en, hi, te, mr };

/** Look up a key, falling back to English and then to the key itself. */
export function translate(lang: LanguageCode, key: string): string {
  return DICTS[lang]?.[key] ?? en[key] ?? key;
}
