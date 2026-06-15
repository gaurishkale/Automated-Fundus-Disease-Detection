import { useEffect, useRef, useState } from "react";
import { AlertCircle, ShieldCheck, Volume2, VolumeX, Globe } from "lucide-react";

// ---------------------------------------------------------------------------
// Multilingual disease data – all 7 supported predictions
// ---------------------------------------------------------------------------
const DISEASE_LANG_DATA = {
  "Diabetic Retinopathy": {
    english: {
      title: "Diabetic Retinopathy Detected",
      symptoms: [
        "Blurred or fluctuating vision",
        "Dark spots or floaters in vision",
        "Impaired color perception",
        "Vision loss in advanced stages",
      ],
      prevention: [
        "Maintain strict blood sugar control",
        "Schedule regular retinal examinations",
        "Adopt a healthy diet rich in green vegetables",
        "Avoid smoking and alcohol consumption",
      ],
      speech:
        "Diabetic Retinopathy has been detected in your retinal scan. This condition affects the blood vessels of the retina due to high blood sugar levels. Please consult an ophthalmologist immediately for further evaluation and treatment.",
    },
    hindi: {
      title: "डायबिटिक रेटिनोपैथी पाई गई है",
      symptoms: [
        "धुंधला या अस्थिर दिखाई देना",
        "आँखों के सामने काले धब्बे या तैरते बिंदु",
        "रंग पहचानने में कठिनाई",
        "उन्नत अवस्था में दृष्टि हानि",
      ],
      prevention: [
        "ब्लड शुगर को सख्ती से नियंत्रित रखें",
        "नियमित रूप से नेत्र जांच कराएँ",
        "हरी सब्जियों से भरपूर स्वस्थ आहार अपनाएँ",
        "धूम्रपान और शराब से बचें",
      ],
      speech:
        "आपकी रेटिनल स्कैन जांच में डायबिटिक रेटिनोपैथी पाई गई है। यह स्थिति उच्च रक्त शर्करा के कारण रेटिना की रक्त वाहिकाओं को प्रभावित करती है। कृपया आगे के मूल्यांकन और उपचार के लिए तुरंत नेत्र विशेषज्ञ से संपर्क करें।",
    },
    marathi: {
      title: "डायबेटिक रेटिनोपॅथी आढळली आहे",
      symptoms: [
        "धूसर किंवा अस्थिर दृष्टी",
        "डोळ्यांसमोर काळे डाग किंवा तरंगणारे ठिपके",
        "रंग ओळखण्यात अडचण",
        "प्रगत अवस्थेत दृष्टी कमी होणे",
      ],
      prevention: [
        "रक्तातील साखर कठोरपणे नियंत्रणात ठेवा",
        "नियमित नेत्र तपासणी करा",
        "पालेभाज्यांनी समृद्ध आहार घ्या",
        "धूम्रपान आणि मद्यपान टाळा",
      ],
      speech:
        "आपल्या रेटिनल स्कॅन तपासणीत डायबेटिक रेटिनोपॅथी आढळली आहे. ही स्थिती उच्च रक्तशर्करेमुळे रेटिनातील रक्तवाहिन्यांवर परिणाम करते. कृपया पुढील मूल्यांकन आणि उपचारांसाठी तात्काळ नेत्रतज्ज्ञांचा सल्ला घ्या.",
    },
  },

  Glaucoma: {
    english: {
      title: "Glaucoma Detected",
      symptoms: [
        "Gradual loss of peripheral vision",
        "Tunnel vision in advanced stages",
        "Severe eye pain and headaches",
        "Halos around lights at night",
      ],
      prevention: [
        "Get regular eye pressure checks",
        "Exercise regularly to reduce eye pressure",
        "Use prescribed eye drops consistently",
        "Know your family history of glaucoma",
      ],
      speech:
        "Glaucoma has been detected in your retinal scan. This condition causes damage to the optic nerve, often due to elevated eye pressure. Early treatment is critical to prevent irreversible vision loss. Please consult an eye specialist immediately.",
    },
    hindi: {
      title: "ग्लूकोमा पाया गया है",
      symptoms: [
        "परिधीय दृष्टि का धीरे-धीरे कम होना",
        "उन्नत अवस्था में सुरंग दृष्टि",
        "गंभीर आँखों का दर्द और सिरदर्द",
        "रात में रोशनी के चारों ओर प्रभामंडल",
      ],
      prevention: [
        "नियमित रूप से आँखों का दबाव जांचवाएँ",
        "नियमित व्यायाम करें",
        "निर्धारित आई ड्रॉप का नियमित उपयोग करें",
        "ग्लूकोमा के पारिवारिक इतिहास की जानकारी रखें",
      ],
      speech:
        "आपकी रेटिनल स्कैन जांच में ग्लूकोमा पाया गया है। यह स्थिति आँखों के बढ़े हुए दबाव के कारण ऑप्टिक नर्व को नुकसान पहुँचाती है। अपरिवर्तनीय दृष्टि हानि को रोकने के लिए शीघ्र उपचार महत्वपूर्ण है। कृपया तुरंत नेत्र विशेषज्ञ से परामर्श करें।",
    },
    marathi: {
      title: "काचबिंदू (ग्लॉकोमा) आढळला आहे",
      symptoms: [
        "बाजूची दृष्टी हळूहळू कमी होणे",
        "प्रगत अवस्थेत बोगद्यासारखी दृष्टी",
        "डोळ्यांत तीव्र वेदना आणि डोकेदुखी",
        "रात्री दिव्यांभोवती प्रभावळ दिसणे",
      ],
      prevention: [
        "नियमित डोळ्यांच्या दाबाची तपासणी करा",
        "नियमित व्यायाम करा",
        "डॉक्टरांनी दिलेले आय ड्रॉप्स नियमित वापरा",
        "काचबिंदूचा कौटुंबिक इतिहास जाणून घ्या",
      ],
      speech:
        "आपल्या रेटिनल स्कॅन तपासणीत काचबिंदू आढळला आहे. ही स्थिती डोळ्यांतील वाढलेल्या दाबामुळे ऑप्टिक नर्व्हला नुकसान करते. अपरिवर्तनीय दृष्टी हानी टाळण्यासाठी तात्काळ उपचार अत्यंत महत्त्वाचे आहेत. कृपया लगेच नेत्रतज्ज्ञांचा सल्ला घ्या.",
    },
  },

  "Age-related Macular Degeneration (AMD)": {
    english: {
      title: "Age-related Macular Degeneration Detected",
      symptoms: [
        "Blurred or distorted central vision",
        "Dark or empty areas in central vision",
        "Difficulty recognizing faces",
        "Straight lines appearing wavy or bent",
      ],
      prevention: [
        "Get regular comprehensive eye exams",
        "Quit smoking immediately",
        "Eat leafy green vegetables and fish",
        "Wear UV-protective sunglasses outdoors",
      ],
      speech:
        "Age-related Macular Degeneration has been detected. This condition affects the macula, the central part of the retina responsible for sharp vision. Early intervention can slow progression. Please schedule an appointment with a retina specialist.",
    },
    hindi: {
      title: "उम्र संबंधी मैक्युलर डिजनरेशन पाया गया है",
      symptoms: [
        "केंद्रीय दृष्टि का धुंधला या विकृत होना",
        "केंद्रीय दृष्टि में अंधेरे या खाली क्षेत्र",
        "चेहरे पहचानने में कठिनाई",
        "सीधी रेखाएँ लहरदार या मुड़ी हुई दिखना",
      ],
      prevention: [
        "नियमित व्यापक नेत्र जांच कराएँ",
        "तुरंत धूम्रपान बंद करें",
        "हरी पत्तेदार सब्जियाँ और मछली खाएँ",
        "बाहर जाते समय UV-सुरक्षित धूप का चश्मा पहनें",
      ],
      speech:
        "आपकी जांच में उम्र संबंधी मैक्युलर डिजनरेशन पाया गया है। यह स्थिति मैक्युला को प्रभावित करती है, जो तीक्ष्ण दृष्टि के लिए जिम्मेदार रेटिना का केंद्रीय भाग है। शीघ्र हस्तक्षेप से प्रगति को धीमा किया जा सकता है। कृपया रेटिना विशेषज्ञ से मिलें।",
    },
    marathi: {
      title: "वयानुसार मॅक्युलर डिजनरेशन आढळले आहे",
      symptoms: [
        "मध्यवर्ती दृष्टी धूसर किंवा विकृत होणे",
        "मध्यवर्ती दृष्टीत अंधारलेले किंवा रिकामे भाग",
        "चेहरे ओळखण्यात अडचण",
        "सरळ रेषा वाकड्या किंवा लहरी दिसणे",
      ],
      prevention: [
        "नियमित सर्वसमावेशक नेत्र तपासणी करा",
        "धूम्रपान तात्काळ बंद करा",
        "पालेभाज्या आणि मासे खा",
        "बाहेर जाताना UV-संरक्षक सनग्लासेस वापरा",
      ],
      speech:
        "आपल्या तपासणीत वयानुसार मॅक्युलर डिजनरेशन आढळले आहे. ही स्थिती मॅक्युलावर परिणाम करते, जो तीक्ष्ण दृष्टीसाठी जबाबदार रेटिनाचा मध्यवर्ती भाग आहे. लवकर हस्तक्षेपाने प्रगती मंद होऊ शकते. कृपया रेटिना तज्ज्ञांची भेट घ्या.",
    },
  },

  Cataract: {
    english: {
      title: "Cataract Detected",
      symptoms: [
        "Cloudy or blurred vision",
        "Increased sensitivity to glare",
        "Fading or yellowing of colors",
        "Difficulty seeing at night",
      ],
      prevention: [
        "Wear sunglasses with UV protection",
        "Quit smoking and limit alcohol intake",
        "Eat antioxidant-rich fruits and vegetables",
        "Manage diabetes and blood sugar levels",
      ],
      speech:
        "A cataract has been detected in your retinal screening. Cataracts cause the lens of the eye to become cloudy, leading to blurred vision. Depending on severity, surgical treatment may be recommended. Please consult an ophthalmologist for further assessment.",
    },
    hindi: {
      title: "मोतियाबिंद पाया गया है",
      symptoms: [
        "धुंधली या कुहासे जैसी दृष्टि",
        "चमक के प्रति बढ़ी संवेदनशीलता",
        "रंगों का फीका या पीला दिखना",
        "रात में देखने में कठिनाई",
      ],
      prevention: [
        "UV सुरक्षा वाले धूप के चश्मे पहनें",
        "धूम्रपान बंद करें और शराब सीमित करें",
        "एंटीऑक्सीडेंट युक्त फल और सब्जियाँ खाएँ",
        "मधुमेह और रक्त शर्करा को नियंत्रित रखें",
      ],
      speech:
        "आपकी रेटिनल स्क्रीनिंग में मोतियाबिंद पाया गया है। मोतियाबिंद आँख के लेंस को धुंधला कर देता है जिससे दृष्टि प्रभावित होती है। गंभीरता के आधार पर सर्जिकल उपचार की सिफारिश की जा सकती है। कृपया आगे के मूल्यांकन के लिए नेत्र विशेषज्ञ से परामर्श करें।",
    },
    marathi: {
      title: "मोतीबिंदू आढळला आहे",
      symptoms: [
        "धूसर किंवा अंधुक दृष्टी",
        "तेजस्वी प्रकाशाप्रती वाढलेली संवेदनशीलता",
        "रंग फिकट किंवा पिवळसर दिसणे",
        "रात्री पाहण्यात अडचण",
      ],
      prevention: [
        "UV संरक्षणासह सनग्लासेस वापरा",
        "धूम्रपान बंद करा आणि मद्यपान मर्यादित करा",
        "अँटिऑक्सिडंट-समृद्ध फळे आणि भाज्या खा",
        "मधुमेह आणि रक्तशर्करा नियंत्रणात ठेवा",
      ],
      speech:
        "आपल्या रेटिनल तपासणीत मोतीबिंदू आढळला आहे. मोतीबिंदूमुळे डोळ्यांची लेन्स ढगाळ होते आणि दृष्टी अंधुक होते. तीव्रतेनुसार शस्त्रक्रियेची शिफारस केली जाऊ शकते. कृपया पुढील मूल्यांकनासाठी नेत्रतज्ज्ञांचा सल्ला घ्या.",
    },
  },

  Hypertension: {
    english: {
      title: "Hypertensive Retinopathy Detected",
      symptoms: [
        "Blurred or reduced vision",
        "Swelling of the optic nerve",
        "Blood vessel narrowing in the retina",
        "Headaches accompanied by vision changes",
      ],
      prevention: [
        "Maintain healthy blood pressure levels",
        "Reduce sodium intake in your diet",
        "Exercise regularly — at least 150 minutes per week",
        "Take blood pressure medications as prescribed",
      ],
      speech:
        "Hypertensive retinopathy has been detected. High blood pressure is causing changes in the blood vessels of your retina. It is important to manage your blood pressure through medication and lifestyle changes. Please consult your doctor promptly.",
    },
    hindi: {
      title: "उच्च रक्तचाप जनित रेटिनोपैथी पाई गई है",
      symptoms: [
        "धुंधली या कम दृष्टि",
        "ऑप्टिक नर्व में सूजन",
        "रेटिना में रक्त वाहिकाओं का सिकुड़ना",
        "दृष्टि परिवर्तन के साथ सिरदर्द",
      ],
      prevention: [
        "रक्तचाप को स्वस्थ स्तर पर बनाए रखें",
        "आहार में नमक का सेवन कम करें",
        "नियमित व्यायाम करें — प्रति सप्ताह कम से कम 150 मिनट",
        "रक्तचाप की दवाइयाँ नियमित रूप से लें",
      ],
      speech:
        "आपकी जांच में उच्च रक्तचाप जनित रेटिनोपैथी पाई गई है। उच्च रक्तचाप आपकी रेटिना की रक्त वाहिकाओं में परिवर्तन कर रहा है। दवाइयों और जीवनशैली में बदलाव के माध्यम से रक्तचाप को नियंत्रित करना महत्वपूर्ण है। कृपया शीघ्र अपने डॉक्टर से परामर्श करें।",
    },
    marathi: {
      title: "उच्च रक्तदाबजन्य रेटिनोपॅथी आढळली आहे",
      symptoms: [
        "धूसर किंवा कमी दृष्टी",
        "ऑप्टिक नर्व्हची सूज",
        "रेटिनातील रक्तवाहिन्या अरुंद होणे",
        "दृष्टी बदलांसह डोकेदुखी",
      ],
      prevention: [
        "रक्तदाब निरोगी पातळीवर ठेवा",
        "आहारातील मिठाचे प्रमाण कमी करा",
        "नियमित व्यायाम करा — दर आठवड्याला किमान 150 मिनिटे",
        "रक्तदाबाची औषधे नियमित घ्या",
      ],
      speech:
        "आपल्या तपासणीत उच्च रक्तदाबजन्य रेटिनोपॅथी आढळली आहे. उच्च रक्तदाबामुळे रेटिनातील रक्तवाहिन्यांमध्ये बदल होत आहेत. औषधे आणि जीवनशैली बदलांद्वारे रक्तदाब नियंत्रित करणे अत्यंत महत्त्वाचे आहे. कृपया तात्काळ तुमच्या डॉक्टरांचा सल्ला घ्या.",
    },
  },

  Myopia: {
    english: {
      title: "Myopia (Near-sightedness) Detected",
      symptoms: [
        "Difficulty seeing distant objects clearly",
        "Squinting to see faraway things",
        "Eye strain and frequent headaches",
        "Need to sit closer to screens or boards",
      ],
      prevention: [
        "Spend more time outdoors — at least 2 hours daily",
        "Follow the 20-20-20 screen rule",
        "Ensure proper lighting when reading",
        "Limit prolonged close-up work sessions",
      ],
      speech:
        "Myopia, also known as near-sightedness, has been detected. This means distant objects appear blurry while close objects are seen clearly. Corrective lenses or other treatments can help manage this condition. Please visit an optometrist for a detailed evaluation.",
    },
    hindi: {
      title: "मायोपिया (निकट दृष्टि दोष) पाया गया है",
      symptoms: [
        "दूर की वस्तुएँ स्पष्ट न दिखना",
        "दूर देखने के लिए आँखें सिकोड़ना",
        "आँखों में तनाव और बार-बार सिरदर्द",
        "स्क्रीन या बोर्ड के करीब बैठने की जरूरत",
      ],
      prevention: [
        "बाहर अधिक समय बिताएँ — प्रतिदिन कम से कम 2 घंटे",
        "20-20-20 स्क्रीन नियम का पालन करें",
        "पढ़ते समय उचित प्रकाश सुनिश्चित करें",
        "लंबे समय तक निकट कार्य सीमित करें",
      ],
      speech:
        "आपकी जांच में मायोपिया यानी निकट दृष्टि दोष पाया गया है। इसका मतलब है कि दूर की वस्तुएँ धुंधली दिखती हैं जबकि पास की वस्तुएँ स्पष्ट दिखती हैं। सुधारात्मक लेंस या अन्य उपचार इस स्थिति को प्रबंधित कर सकते हैं। कृपया विस्तृत मूल्यांकन के लिए ऑप्टोमेट्रिस्ट से मिलें।",
    },
    marathi: {
      title: "मायोपिया (जवळची दृष्टी) आढळली आहे",
      symptoms: [
        "दूरच्या वस्तू स्पष्ट न दिसणे",
        "दूर पाहण्यासाठी डोळे बारीक करणे",
        "डोळ्यांवर ताण आणि वारंवार डोकेदुखी",
        "स्क्रीन किंवा बोर्डजवळ बसण्याची गरज",
      ],
      prevention: [
        "बाहेर अधिक वेळ घालवा — दररोज किमान 2 तास",
        "20-20-20 स्क्रीन नियम पाळा",
        "वाचताना योग्य प्रकाश असल्याची खात्री करा",
        "दीर्घकाळ जवळचे काम मर्यादित करा",
      ],
      speech:
        "आपल्या तपासणीत मायोपिया म्हणजे जवळची दृष्टी आढळली आहे. याचा अर्थ दूरच्या वस्तू अंधुक दिसतात तर जवळच्या वस्तू स्पष्ट दिसतात. सुधारात्मक लेन्स किंवा इतर उपचारांनी ही स्थिती व्यवस्थापित करता येते. कृपया सविस्तर मूल्यांकनासाठी ऑप्टोमेट्रिस्टला भेट द्या.",
    },
  },

  Normal: {
    english: {
      title: "No Abnormalities Detected",
      symptoms: [
        "No significant abnormalities detected",
        "Retinal structure appears healthy",
        "Optic nerve head looks normal",
        "Blood vessels show a normal pattern",
      ],
      prevention: [
        "Continue annual eye check-ups",
        "Maintain a balanced, nutrient-rich diet",
        "Wear sunglasses outdoors to protect eyes",
        "Take regular screen breaks throughout the day",
      ],
      speech:
        "Great news! Your retinal scan shows no significant abnormalities. Your eyes appear healthy. Continue maintaining good eye health habits with regular check-ups, a balanced diet, and adequate rest for your eyes.",
    },
    hindi: {
      title: "कोई असामान्यता नहीं पाई गई",
      symptoms: [
        "कोई महत्वपूर्ण असामान्यता नहीं पाई गई",
        "रेटिना की संरचना स्वस्थ दिखती है",
        "ऑप्टिक नर्व हेड सामान्य दिखता है",
        "रक्त वाहिकाएँ सामान्य पैटर्न दिखाती हैं",
      ],
      prevention: [
        "वार्षिक नेत्र जांच जारी रखें",
        "संतुलित, पोषक तत्वों से भरपूर आहार बनाए रखें",
        "बाहर जाते समय धूप का चश्मा पहनें",
        "दिन भर में नियमित स्क्रीन ब्रेक लें",
      ],
      speech:
        "अच्छी खबर! आपकी रेटिनल स्कैन में कोई महत्वपूर्ण असामान्यता नहीं पाई गई है। आपकी आँखें स्वस्थ दिखती हैं। नियमित जांच, संतुलित आहार और आँखों के लिए पर्याप्त आराम के साथ अच्छी आँखों की सेहत बनाए रखें।",
    },
    marathi: {
      title: "कोणतीही असामान्यता आढळली नाही",
      symptoms: [
        "कोणतीही महत्त्वपूर्ण असामान्यता आढळली नाही",
        "रेटिनाची रचना निरोगी दिसते",
        "ऑप्टिक नर्व्ह हेड सामान्य दिसतो",
        "रक्तवाहिन्या सामान्य नमुना दर्शवतात",
      ],
      prevention: [
        "वार्षिक नेत्र तपासणी सुरू ठेवा",
        "संतुलित, पोषक तत्त्वांनी समृद्ध आहार ठेवा",
        "बाहेर जाताना सनग्लासेस वापरा",
        "दिवसभरात नियमित स्क्रीन ब्रेक घ्या",
      ],
      speech:
        "चांगली बातमी! आपल्या रेटिनल स्कॅनमध्ये कोणतीही महत्त्वपूर्ण असामान्यता आढळली नाही. तुमचे डोळे निरोगी दिसतात. नियमित तपासणी, संतुलित आहार आणि डोळ्यांना पुरेशी विश्रांती देऊन चांगले नेत्र आरोग्य टिकवून ठेवा.",
    },
  },
};

const LANGUAGES = [
  { key: "english", label: "English" },
  { key: "hindi", label: "हिंदी" },
  { key: "marathi", label: "मराठी" },
];

const LANG_CODES = { english: "en-IN", hindi: "hi-IN", marathi: "mr-IN" };
const LANG_FALLBACKS = { marathi: ["mr-IN", "mr", "hi-IN", "hi"], hindi: ["hi-IN", "hi"], english: ["en-IN", "en-US", "en-GB", "en"] };

// ---------------------------------------------------------------------------
// Sound-wave bars shown while speaking
// ---------------------------------------------------------------------------
function SoundWave() {
  return (
    <span className="ml-2 inline-flex items-end gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-full bg-white"
          style={{
            animation: `pe-wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
            height: `${8 + ((i % 3) * 4)}px`,
          }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Staggered bullet item
// ---------------------------------------------------------------------------
function BulletItem({ text, index, isVisible, accentColor }) {
  return (
    <li
      className={`flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentColor}`}
      />
      {text}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function findBestVoice(voices, langKey) {
  const candidates = LANG_FALLBACKS[langKey] || [LANG_CODES[langKey]];
  for (const code of candidates) {
    const lower = code.toLowerCase();
    const exact = voices.find((v) => v.lang.toLowerCase() === lower);
    if (exact) return exact;
    const prefix = lower.split("-")[0];
    const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (partial) return partial;
  }
  return null;
}

function PatientExplanation({ disease }) {
  const [selectedLang, setSelectedLang] = useState("english");
  const [isVisible, setIsVisible] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenLang, setSpokenLang] = useState(null);
  const [voiceFallbackMsg, setVoiceFallbackMsg] = useState("");
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(window.speechSynthesis);

  const data = DISEASE_LANG_DATA[disease];

  // Pre-load available voices (they load async in most browsers)
  useEffect(() => {
    const synth = synthRef.current;
    const loadVoices = () => {
      const available = synth.getVoices();
      if (available.length) setVoices(available);
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // Reset animations on disease or language change
  useEffect(() => {
    setIsVisible(false);
    setShowItems(false);
    setVoiceFallbackMsg("");
    const t1 = window.setTimeout(() => setIsVisible(true), 80);
    const t2 = window.setTimeout(() => setShowItems(true), 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [disease, selectedLang]);

  // Stop speech when component unmounts or disease changes
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
      setIsSpeaking(false);
    };
  }, [disease]);

  if (!data) return null;

  const info = data[selectedLang];
  if (!info) return null;

  const isNormal = disease === "Normal";

  const handleSpeak = () => {
    const synth = synthRef.current;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      setSpokenLang(null);
      setVoiceFallbackMsg("");
      return;
    }

    synth.cancel();

    const available = synth.getVoices();
    const voiceList = available.length ? available : voices;

    const voice = findBestVoice(voiceList, selectedLang);
    const usedLangCode = voice ? voice.lang : LANG_CODES[selectedLang];

    if (selectedLang === "marathi" && voice && !voice.lang.toLowerCase().startsWith("mr")) {
      setVoiceFallbackMsg(
        "Marathi voice not available on this device. Using Hindi voice as fallback."
      );
    } else {
      setVoiceFallbackMsg("");
    }

    const utterance = new SpeechSynthesisUtterance(info.speech);
    if (voice) utterance.voice = voice;
    utterance.lang = usedLangCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpokenLang(selectedLang);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpokenLang(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpokenLang(null);
    };

    synth.speak(utterance);
  };

  return (
    <div
      className={`mt-8 transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

      {/* Section header */}
      <div className="mt-8 mb-2 text-center">
        <div className="relative inline-block">
          <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Patient Explanation
          </h3>
          <span className="absolute -inset-x-4 -inset-y-1 -z-10 animate-[pe-pulse_3s_ease-in-out_infinite] rounded-lg bg-blue-50" />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Understand your diagnosis in your preferred language
        </p>
      </div>

      {/* Language toggle */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <Globe className="h-4 w-4 text-slate-400" />
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  synthRef.current.cancel();
                  setIsSpeaking(false);
                  setSpokenLang(null);
                }
                setSelectedLang(lang.key);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                selectedLang === lang.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title card */}
      <div className="mb-5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 p-5 shadow-sm">
        <h4 className="text-lg font-bold text-slate-900">{info.title}</h4>
      </div>

      {/* Symptoms + Prevention grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Symptoms */}
        <div className="group overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <AlertCircle className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-slate-900">
                {isNormal
                  ? selectedLang === "hindi"
                    ? "अवलोकन"
                    : selectedLang === "marathi"
                    ? "निरीक्षणे"
                    : "Observations"
                  : selectedLang === "hindi"
                  ? "लक्षण"
                  : selectedLang === "marathi"
                  ? "लक्षणे"
                  : "Symptoms"}
              </span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {info.symptoms.map((item, i) => (
                <BulletItem
                  key={`${selectedLang}-s-${i}`}
                  text={item}
                  index={i}
                  isVisible={showItems}
                  accentColor="bg-blue-500"
                />
              ))}
            </ul>
          </div>
        </div>

        {/* Prevention */}
        <div className="group overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-slate-900">
                {selectedLang === "hindi"
                  ? "बचाव"
                  : selectedLang === "marathi"
                  ? "प्रतिबंध"
                  : "Prevention"}
              </span>
            </div>
          </div>
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {info.prevention.map((item, i) => (
                <BulletItem
                  key={`${selectedLang}-p-${i}`}
                  text={item}
                  index={i}
                  isVisible={showItems}
                  accentColor="bg-teal-500"
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Voice explanation */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleSpeak}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] ${
            isSpeaking
              ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/20"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/20"
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-5 w-5" />
              {selectedLang === "hindi"
                ? "रोकें"
                : selectedLang === "marathi"
                ? "थांबवा"
                : "Stop Voice"}
              <SoundWave />
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              {selectedLang === "hindi"
                ? "सुनें"
                : selectedLang === "marathi"
                ? "ऐका"
                : "Listen Explanation"}
            </>
          )}
        </button>
        {isSpeaking && spokenLang && (
          <p className="mt-2 text-xs text-slate-400 animate-pulse">
            {spokenLang === "hindi"
              ? "बोल रहा है..."
              : spokenLang === "marathi"
              ? "बोलत आहे..."
              : "Speaking..."}
          </p>
        )}
        {voiceFallbackMsg && (
          <p className="mt-2 text-xs font-medium text-amber-600">
            {voiceFallbackMsg}
          </p>
        )}
      </div>

      <style>
        {`@keyframes pe-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.03); }
          }
          @keyframes pe-wave {
            0% { height: 4px; }
            100% { height: 16px; }
          }`}
      </style>
    </div>
  );
}

export default PatientExplanation;
