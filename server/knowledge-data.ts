export interface KnowledgeItem {
  id: string;
  category: 'orders' | 'shipping' | 'refunds' | 'payments' | 'account' | 'general';
  categoryLabel: string;
  question: string;
  questionTa: string;
  answer: string;
  answerTa: string;
  keywords: string[];
  updatedAt: string;
}

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: "kb-001",
    category: "orders",
    categoryLabel: "Orders & Tracking",
    question: "How do I track my order status?",
    questionTa: "எனது ஆர்டர் நிலையை எவ்வாறு கண்காணிப்பது?",
    answer: "You can track your order in real-time by going to the 'Orders' section in your account or by providing your 6-digit Order ID (e.g., #ORD-10294) directly in this chat. Tracking updates include Dispatch, In-Transit, Out for Delivery, and Delivered. Standard delivery takes 2-4 business days.",
    answerTa: "உங்கள் கணக்கில் உள்ள 'ஆர்டர்கள்' பகுதிக்குச் சென்று அல்லது உங்கள் 6 இலக்க ஆர்டர் ஐடியை (#ORD-10294 போன்றது) இந்த அரட்டையில் நேரடியாகக் குறிப்பிடுவதன் மூலம் உங்கள் ஆர்டரின் நிலையை நிகழ்நேரத்தில் கண்காணிக்கலாம். நிலையான டெலிவரிக்கு 2-4 வணிக நாட்கள் ஆகும்.",
    keywords: ["track", "order status", "where is my package", "delivery date", "tracking id", "ord-"],
    updatedAt: "2026-10-15"
  },
  {
    id: "kb-002",
    category: "orders",
    categoryLabel: "Orders & Tracking",
    question: "Can I cancel or modify an order after placing it?",
    questionTa: "ஆர்டர் செய்த பிறகு அதை ரத்து செய்யவோ அல்லது மாற்றவோ முடியுமா?",
    answer: "Orders can be cancelled or modified within 60 minutes of placement directly from your Order History page. Once the order reaches the 'Warehouse Processing' or 'Shipped' stage, it cannot be modified or cancelled, but you can initiate a return or refuse delivery upon arrival for a full refund.",
    answerTa: "ஆர்டர் செய்த 60 நிமிடங்களுக்குள் உங்கள் ஆர்டர் வரலாற்றுப் பக்கத்திலிருந்து நேரடியாக ரத்து செய்யலாம் அல்லது திருத்தலாம். கிடங்கு செயலாக்கம் அல்லது அனுப்பப்பட்ட நிலைக்குச் சென்ற பிறகு அதை மாற்ற முடியாது, ஆனால் வந்தவுடன் திருப்பியளித்து முழுப் பணத்தையும் திரும்பப் பெறலாம்.",
    keywords: ["cancel order", "modify order", "change address", "cancel items"],
    updatedAt: "2026-10-14"
  },
  {
    id: "kb-003",
    category: "refunds",
    categoryLabel: "Refunds & Returns",
    question: "What is your refund and return policy?",
    questionTa: "உங்கள் பணத்தைத் திரும்பப் பெறுதல் மற்றும் பொருட்கள் திரும்புதல் கொள்கை என்ன?",
    answer: "We offer a 30-day hassle-free return window for all unused items in their original packaging. Once our inspection team receives the return package, refunds are processed within 3 to 5 business days back to your original payment method (Credit/Debit Card, UPI, Net Banking, or Store Credit).",
    answerTa: "பயன்படுத்தப்படாத மற்றும் அசல் பேக்கேஜிங்கில் உள்ள அனைத்து பொருட்களுக்கும் 30 நாள் எளிய ரிட்டர்ன் வசதியை வழங்குகிறோம். பொருள் பெறப்பட்டதும், 3 முதல் 5 வணிக நாட்களுக்குள் உங்கள் அசல் கட்டண முறைக்கு (UPI, கார்டு, நெட் பேங்கிங்) பணம் திரும்பச் செலுத்தப்படும்.",
    keywords: ["refund policy", "return policy", "money back", "30 days", "return window", "refund timeline"],
    updatedAt: "2026-10-16"
  },
  {
    id: "kb-004",
    category: "refunds",
    categoryLabel: "Refunds & Returns",
    question: "How long does a refund take to reflect in my bank account?",
    questionTa: "பணம் எனது வங்கிக் கணக்கில் வர எவ்வளவு காலம் ஆகும்?",
    answer: "Once our finance team initiates the refund, it takes 3-5 business days for Credit/Debit Cards and Net Banking. UPI refunds are typically instant or within 24 hours. If you haven't received your refund after 7 business days, please open a Human Support Ticket with your Bank Reference Number (ARN).",
    answerTa: "பணத்தைத் திரும்பப்பெறுதல் தொடங்கியதும், கார்டுகள் மற்றும் நெட் பேங்கிங்கிற்கு 3-5 வணிக நாட்கள் ஆகும். UPI ரீஃபண்டுகள் பொதுவாக உடனடியாக அல்லது 24 மணி நேரத்திற்குள் வரவு வைக்கப்படும். 7 நாட்களுக்குப் பிறகும் வரவில்லை எனில் ஆதரவு டிக்கெட்டைத் திறக்கவும்.",
    keywords: ["refund delay", "refund timeline", "upi refund", "bank account", "refund status"],
    updatedAt: "2026-10-12"
  },
  {
    id: "kb-005",
    category: "shipping",
    categoryLabel: "Shipping & Delivery",
    question: "What are your shipping rates and delivery timelines?",
    questionTa: "டெலிவரி கட்டணங்கள் மற்றும் டெலிவரி காலக்கெடு என்ன?",
    answer: "Standard Shipping is FREE on all orders over $35 (delivery in 3-5 business days). Express Priority Shipping is available for $5.99 (delivery in 1-2 business days). Orders placed before 2:00 PM EST are dispatched the same day from our nearest fulfillment hub.",
    answerTa: "$35க்கு மேற்பட்ட அனைத்து ஆர்டர்களுக்கும் நிலையான டெலிவரி இலவசம் (3-5 வணிக நாட்கள்). எக்ஸ்பிரஸ் டெலிவரி $5.99 கட்டணத்தில் 1-2 நாட்களில் கிடைக்கும். மதியம் 2:00 மணிக்குள் வரும் ஆர்டர்கள் அன்றே அனுப்பப்படும்.",
    keywords: ["shipping cost", "delivery time", "free shipping", "express delivery", "same day"],
    updatedAt: "2026-10-15"
  },
  {
    id: "kb-006",
    category: "shipping",
    categoryLabel: "Shipping & Delivery",
    question: "Do you deliver internationally?",
    questionTa: "சர்வதேச அளவில் டெலிவரி செய்கிறீர்களா?",
    answer: "Yes, we ship to over 65 countries worldwide including the US, Canada, UK, EU, India, Singapore, and Australia. International shipping usually takes 6-10 business days. Import duties and local customs taxes are calculated at checkout so there are no surprise charges at your doorstep.",
    answerTa: "ஆம், அமெரிக்கா, கனடா, ஐரோப்பா, இந்தியா, சிங்கப்பூர் உள்ளிட்ட 65க்கும் மேற்பட்ட நாடுகளுக்கு டெலிவரி செய்கிறோம். சர்வதேச கப்பல் போக்குவரத்து 6-10 வணிக நாட்கள் ஆகும். வரிகள் செக்-அவுட்டிலேயே கணக்கிடப்படும்.",
    keywords: ["international shipping", "overseas delivery", "customs", "worldwide", "countries"],
    updatedAt: "2026-10-10"
  },
  {
    id: "kb-007",
    category: "payments",
    categoryLabel: "Payment & Billing",
    question: "What payment methods are supported?",
    questionTa: "எந்த கட்டண முறைகள் ஆதரிக்கப்படுகின்றன?",
    answer: "We accept Visa, MasterCard, American Express, Discover, PayPal, Apple Pay, Google Pay, and UPI / Net Banking. All transactions are protected by end-to-end 256-bit SSL encryption and PCI-DSS Level 1 compliant gateways.",
    answerTa: "விசா, மாஸ்டர்கார்டு, அமெரிக்கன் எக்ஸ்பிரஸ், பேபால், ஆப்பிள் பே, கூகிள் பே, UPI மற்றும் நெட் பேங்கிங் ஆகியவற்றை ஏற்றுக்கொள்கிறோம். அனைத்து பரிவர்த்தனைகளும் பாதுகாப்பான 256-பிட் குறியாக்கத்துடன் பாதுகாக்கப்படுகின்றன.",
    keywords: ["payment methods", "credit card", "debit card", "paypal", "upi", "google pay", "apple pay"],
    updatedAt: "2026-10-16"
  },
  {
    id: "kb-008",
    category: "payments",
    categoryLabel: "Payment & Billing",
    question: "What should I do if my payment was deducted but the order failed?",
    questionTa: "பணம் பிடிக்கப்பட்டு ஆனால் ஆர்டர் தோல்வியடைந்தால் நான் என்ன செய்ய வேண்டும்?",
    answer: "Do not worry! If an order fails after deduction, your bank holds the amount in an escrow settlement. The payment gateway will automatically reverse the transaction within 24 to 48 hours back to your account. If the amount is not reversed within 48 hours, share your Transaction Reference / UTR ID with us via a Support Ticket.",
    answerTa: "கவலைப்பட வேண்டாம்! பணம் பிடிக்கப்பட்டு ஆர்டர் தோல்வியடைந்தால், வங்கி தானாகவே 24 முதல் 48 மணி நேரத்திற்குள் பணத்தை உங்கள் கணக்கிற்குத் திருப்பி அனுப்பிவிடும். 48 மணி நேரத்திற்குப் பிறகும் வராவிட்டால் பரிவர்த்தனை ஐடியுடன் டிக்கெட் திறக்கவும்.",
    keywords: ["payment deducted", "order failed", "money deducted", "failed transaction", "payment issue"],
    updatedAt: "2026-10-15"
  },
  {
    id: "kb-009",
    category: "account",
    categoryLabel: "Account & Security",
    question: "How do I reset my account password or update my email?",
    questionTa: "எனது கடவுச்சொல்லை மாற்றுவது அல்லது மின்னஞ்சலை புதுப்பிப்பது எப்படி?",
    answer: "Click on 'Sign In' at the top right, select 'Forgot Password', and enter your registered email address. You will receive a secure reset link valid for 15 minutes. To update your email or phone number, visit 'Account Settings' > 'Security' while logged in.",
    answerTa: "மேல் வலதுபுறத்தில் 'உள்நுழை' என்பதைக் கிளிக் செய்து, 'கடவுச்சொல்லை மறந்துவிட்டீர்களா' என்பதைத் தேர்ந்தெடுத்து, உங்கள் மின்னஞ்சலை உள்ளிடவும். 15 நிமிடங்களுக்கு செல்லுபடியாகும் மீட்டமைப்பு இணைப்பு உங்களுக்கு அனுப்பப்படும்.",
    keywords: ["reset password", "forgot password", "change email", "account recovery", "login issue"],
    updatedAt: "2026-10-11"
  },
  {
    id: "kb-010",
    category: "general",
    categoryLabel: "Support & Escalation",
    question: "How can I speak to a human customer service representative?",
    questionTa: "மனித வாடிக்கையாளர் சேவை அதிகாரியிடம் நான் எவ்வாறு பேசுவது?",
    answer: "You can connect with our human support team anytime! Simply click the 'Contact Support' button in the chat or fill out the Support Ticket form with your issue details. Our live human agents are available 24/7 and respond to high-priority tickets within 15-30 minutes.",
    answerTa: "எங்கள் நேரடி வாடிக்கையாளர் ஆதரவுக் குழுவை நீங்கள் எந்த நேரத்திலும் தொடர்பு கொள்ளலாம்! அரட்டையில் உள்ள 'ஆதரவு தொடர்பு' பொத்தானைக் கிளிக் செய்யவும் அல்லது ஆதரவு படிவத்தை நிரப்பவும். எங்கள் முகவர்கள் 24/7 உங்களுக்கு உதவ தயாராக உள்ளனர்.",
    keywords: ["human agent", "talk to human", "representative", "contact support", "live agent", "phone number"],
    updatedAt: "2026-10-16"
  }
];

export const SAMPLE_ORDERS: Record<string, {
  orderId: string;
  customerName: string;
  items: string[];
  total: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  destination: string;
}> = {
  "ORD-10294": {
    orderId: "ORD-10294",
    customerName: "Alex Morgan",
    items: ["Wireless Noise-Canceling Headphones", "USB-C Braided Cable 2m"],
    total: "$149.50",
    status: "Out for Delivery",
    carrier: "FedEx Express",
    trackingNumber: "FX-78291044",
    estimatedDelivery: "Today by 6:00 PM",
    destination: "Seattle, WA, USA"
  },
  "ORD-98234": {
    orderId: "ORD-98234",
    customerName: "Priya Sharma",
    items: ["Ergonomic Mechanical Keyboard", "Wrist Rest Pad"],
    total: "$89.99",
    status: "Shipped",
    carrier: "DHL Express",
    trackingNumber: "DHL-44910283",
    estimatedDelivery: "In 2 days",
    destination: "Chennai, TN, India"
  },
  "ORD-77120": {
    orderId: "ORD-77120",
    customerName: "David Chen",
    items: ["Smart Fitness Band Gen 4"],
    total: "$59.00",
    status: "Delivered",
    carrier: "UPS Ground",
    trackingNumber: "1Z9999999999999999",
    estimatedDelivery: "Delivered on Yesterday",
    destination: "Austin, TX, USA"
  }
};
