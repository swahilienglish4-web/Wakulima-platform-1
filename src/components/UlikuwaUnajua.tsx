import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  RotateCw, 
  ThumbsUp, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  BookOpen, 
  Lightbulb, 
  Heart,
  MessageSquare,
  Sprout,
  Share2
} from "lucide-react";

export interface Fact {
  id: string;
  category: "mifugo" | "mazao" | "pembejeo" | "maajabu";
  title: string;
  fact: string;
  science: string;
  funnyQuote: string;
  emoji: string;
  iconName: string;
}

export function getStartingLikes(factId: string): number {
  // Deterministic starting likes between 35 and 75 based on fact numeric id
  const seed = factId.split("_")[1] ? parseInt(factId.split("_")[1]) : 5;
  return (seed * 7) % 40 + 35;
}

export const FARMING_FACTS: Fact[] = [
  {
    id: "fact_1",
    category: "mifugo",
    title: "Ng'ombe na Burudani ya Muziki",
    fact: "Ng'ombe wanaosikiliza muziki laini na wa taratibu hutoa maziwa mengi zaidi hadi asilimia 3% kwa siku!",
    science: "Utafiti wa Chuo Kikuu cha Leicester ulionyesha kuwa muziki tulivu hupunguza msongo wa mawazo (stress) kwa ng'ombe na kuchochea homoni ya oxytocin inayohusika na utengenezaji wa maziwa.",
    funnyQuote: "Ukimshangaa ng'ombe anavyocheua, jaribu kumtayarishia playlist ya nyimbo za taratibu uone maajabu ya ndoo kujaa!",
    emoji: "🐄",
    iconName: "Music"
  },
  {
    id: "fact_2",
    category: "mifugo",
    title: "Kumbukumbu ya Kuku",
    fact: "Kuku wana uwezo mkubwa wa kumbukumbu! Wanaweza kutambua na kukumbuka sura za watu zaidi ya 100 tofauti.",
    science: "Kuku wana uwezo mkubwa wa utambuzi wa kijamii (social recognition) na wanaweza kutofautisha kati ya watu wema wanaowalisha na watu wanaowatishia maisha.",
    funnyQuote: "Usimchukulie poa kuku wa kienyeji bandani kwako, anajua fika nani ndio mpishi na nani anamletea pumba!",
    emoji: "🐔",
    iconName: "Brain"
  },
  {
    id: "fact_3",
    category: "mifugo",
    title: "Macho ya Mbuzi kuona Pembe zote",
    fact: "Macho ya mbuzi yana mboni zenye umbo la mstatili unaowapa uwezo wa kuona karibu nyuzi 320 hadi 340 bila kugeuza kichwa!",
    science: "Mboni hizi za mlalo (horizontal slit pupils) huruhusu mbuzi kupata picha pana ya mazingira yao ya pembeni, jambo linalowasaidia kugundua maadui wanaojificha porini haraka wakiwa wanakula nyasi.",
    funnyQuote: "Mbuzi hakuangalii lakini anajua vizuri kuwa unamsogelea ukiwa na kamba mkononi. Ana panoramic view!",
    emoji: "🐐",
    iconName: "Eye"
  },
  {
    id: "fact_4",
    category: "mazao",
    title: "Mmea wa Ndizi Sio Mti kabisa!",
    fact: "Mmea wa ndizi sio mti kiuhalisia, bali ni nyasi kubwa kuliko zote duniani (giant herb).",
    science: "Shina la ndizi (pseudostem) halina seli za mbao (woody tissue) kama miti mingine. Badala yake, limetengenezwa na tabaka ngumu za majani yaliyosongamana kwa pamoja kuunda nguzo imara.",
    funnyQuote: "Kwa hiyo, unapoingia kwenye mgomba, kiuhalisia unatembea kwenye bustani ya majani yaliyochangamka sana!",
    emoji: "🍌",
    iconName: "Sprout"
  },
  {
    id: "fact_5",
    category: "pembejeo",
    title: "Mbolea ya Sungura ni Dhahabu ya Kijani",
    fact: "Mbolea ya sungura ndiyo mbolea pekee ya mifugo ambayo unaweza kuiweka shambani moja kwa moja bila kusubiri ioze.",
    science: "Tofauti na mbolea ya kuku au ng'ombe, mbolea ya sungura (rabbit manure) ni 'baridi' (cold manure) na haina joto kali linaloweza kuunguza mizizi ya mimea yako, huku ikiwa na viwango vikubwa vya Nitrogen na Phosphorus.",
    funnyQuote: "Sungura sio tu wa kupendeza na watamu, bali mbolea yao ni kama chakula tayari kilichopikwa kwa ajili ya mimea yako!",
    emoji: "🐇",
    iconName: "Award"
  },
  {
    id: "fact_6",
    category: "maajabu",
    title: "Pua za Ng'ombe ni Alama ya Vidole",
    fact: "Kila ng'ombe ana alama za kipekee kwenye pua yake (nose prints), sawa kabisa na alama za vidole vya binadamu.",
    science: "Michirizi na nukta zilizopo kwenye ngozi ya pua ya ng'ombe hazifanani kabisa kati ya ng'ombe mmoja na mwingine, na zinaweza kutumika kama kitambulisho cha kipekee (identification lock).",
    funnyQuote: "Siku za usoni labda ng'ombe watafungua simu zao kwa kutumia 'Nose ID' badala ya Face ID!",
    emoji: "🐂",
    iconName: "Fingerprint"
  },
  {
    id: "fact_7",
    category: "maajabu",
    title: "Minyoo ya Udongo ni Wafanyakazi Wasio na Mshahara",
    fact: "Minyoo ya udongo inaweza kula udongo na mabaki ya mimea yenye uzito sawa na miili yao kila siku.",
    science: "Minyoo (earthworms) inapotengeneza tundu ardhini inapitisha hewa na maji, na mfumo wao wa kusaga chakula huongeza virutubisho vya udongo mara tano zaidi ya udongo wa kawaida (vermicompost).",
    funnyQuote: "Wakulima wazuri hawajivunii trekta pekee, bali wanajivunia jeshi la minyoo linalofanya kazi masaa 24 bure ardhini!",
    emoji: "🪱",
    iconName: "Sparkles"
  },
  {
    id: "fact_8",
    category: "maajabu",
    title: "Kazi Ngumu ya Nyuki wa Asali",
    fact: "Ili kutengeneza nusu kilo ya asali, kundi la nyuki linahitaji kuruka umbali sawa na kuzunguka dunia mara tatu na kutembelea maua milioni mbili!",
    science: "Nyuki mmoja wa asali katika maisha yake yote huchangia wastani wa kijiko kimoja tu cha chai cha asali. Ushirikiano wao mkubwa ndio unaoleta asali nyingi tunayofurahia.",
    funnyQuote: "Kila tone la asali unalolamba ni matokeo ya safari ndefu kuliko safari ya kwenda mwezini. Tuwaheshimu nyuki wetu!",
    emoji: "🐝",
    iconName: "Activity"
  },
  {
    id: "fact_9",
    category: "mifugo",
    title: "Nguruwe Hawatoi Jasho Kamwe!",
    fact: "Nguruwe hawana tezi za kutoa jasho (sweat glands). Ndiyo maana wanapenda sana kujigaragaza kwenye matope ili kupunguza joto.",
    science: "Ngozi ya nguruwe haina uwezo wa kutoa jasho kujipooza. Matope yenye unyevu yanapokauka kwenye ngozi yao hufyonza joto la mwili na kuwalinda pia na mionzi mikali ya jua na wadudu.",
    funnyQuote: "Mtu akikuambia unatoa jasho kama nguruwe, mjibu kitaalamu: 'Nguruwe hatoi jasho kabisa, mimi najitahidi kujiweka sawa!'",
    emoji: "🐖",
    iconName: "Shield"
  },
  {
    id: "fact_10",
    category: "mazao",
    title: "Miti ya Mwembe Inaishi Karne Nyingi",
    fact: "Mwembe unaweza kuendelea kutoa matunda bora hata ukiwa na umri wa miaka 300!",
    science: "Miti ya miembe (Mango trees) ina mizizi mirefu sana inayoweza kwenda chini futi 20-30 kutafuta maji, na stamina yake ya seli inaruhusu kuendelea kutoa maua na matunda kwa karne nyingi.",
    funnyQuote: "Mwembe uliopandwa na babu wa babu yako leo bado unaweza kukupa embe tamu la msimu. Huu ndio uwekezaji vya kudumu!",
    emoji: "🥭",
    iconName: "Calendar"
  },
  {
    id: "fact_11",
    category: "pembejeo",
    title: "Mkojo wa Sungura kama Kiua Wadudu",
    fact: "Mkojo wa sungura ni mbolea ya maji (foliar) na pia ni dawa madhubuti ya kufukuza wadudu shambani.",
    science: "Mkojo wa sungura una viwango vikubwa vya ammonia na harufu kali ambayo hufukuza wadudu waharibifu (repellent), wakati huohuo majani yakifyonza virutubisho vya Nitrogen vilivyomo.",
    funnyQuote: "Huna haja ya kununua kemikali zenye sumu kila mara, sungura wako ni duka la dawa na mbolea lisiloisha hisani!",
    emoji: "🐇",
    iconName: "Zap"
  },
  {
    id: "fact_12",
    category: "pembejeo",
    title: "Vitunguu Saumu kama Kinga ya Mazao",
    fact: "Vitunguu saumu ni kiua wadudu cha asili. Ukisaga vitunguu saumu na kuvichanganya na maji ya sabuni, unapata dawa ya asili ya kufukuza wadudu.",
    science: "Vitunguu saumu vina kemikali ya Allicin yenye harufu kali na sifa ya kupambana na fangasi pamoja na kufukuza wadudu bila kuharibu mazingira au mimea.",
    funnyQuote: "Mbali na kuleta ladha nzuri jikoni, vitunguu saumu vinawapa wadudu harufu inayowafanya wakimbie bila kugeuka nyuma!",
    emoji: "🧄",
    iconName: "Shield"
  },
  {
    id: "fact_13",
    category: "mifugo",
    title: "Kondoo Hawasahau Sura!",
    fact: "Kondoo wana uwezo wa kukumbuka na kutofautisha sura za kondoo wengine na hata binadamu kwa zaidi ya miaka miwili!",
    science: "Kondoo wana mfumo maalum wa ubongo wa kutambua sura unaofanana sana na wa binadamu, unaowasaidia kukumbuka nani alikuwa rafiki au adui.",
    funnyQuote: "Usimcheke kondoo kwa upole wake, anajua fika nani alimnyoa sufu msimu uliopita na nani alimpa majani!",
    emoji: "🐑",
    iconName: "User"
  },
  {
    id: "fact_14",
    category: "maajabu",
    title: "Miti Inayoongea na Kujilinda",
    fact: "Wakati miti ya acacia inaposhambuliwa na wanyama, hutoa gesi ya ethylene kuonya miti mingine ya karibu ili ianze kutengeneza sumu ya tannin kujilinda.",
    science: "Ethylene ni homoni ya mimea inayoweza kusafiri kwa njia ya hewa kama ishara ya dharura (chemical signaling), inayochochea miti jirani kuanza uzalishaji wa tannin kujikinga na wanyama wanaokula majani.",
    funnyQuote: "Miti pia ina 'Group Chat' yake ya dharura kupitia hewa ili kujiandaa na maadui wanaokuja!",
    emoji: "🌳",
    iconName: "MessageSquare"
  },
  {
    id: "fact_15",
    category: "mazao",
    title: "Safari ya Alizeti na Jua",
    fact: "Maua machanga ya alizeti hufuata jua kuanzia mashariki hadi magharibi kila siku, lakini yanapokomaa, huacha kugeuka na kubaki yakitazama mashariki.",
    science: "Tabia hii inaitwa Heliotropism. Alizeti mchanga hukua kwa haraka upande wa kivuli ili kugeuza ua kuelekea jua. Inapokomaa, inatulia ikitazama mashariki ili kupata joto la asubuhi ambalo huvutia nyuki wengi kwa ajili ya uchavushaji.",
    funnyQuote: "Alizeti inazeeka ikiwa na nidhamu ya kutazama mashariki, asubuhi ikikutana na jua kwanza kabisa!",
    emoji: "🌻",
    iconName: "Sun"
  },
  {
    id: "fact_16",
    category: "mazao",
    title: "Maajabu ya Nyuzi za Mahindi",
    fact: "Kila unywele mmoja kwenye mshikio wa mahindi (corn silk) umeunganishwa moja kwa moja na mbegu moja ya hifadhi ya mahindi. Bila nyuzi doomed, punje haziwezi kukua.",
    science: "Nywele hizi ni sehemu ya mfumo wa kike wa uzazi wa mmea (stigma na style). Kila unywele unahitaji kupokea chembe ya mbelewele (pollen) kutoka kwenye mbelewele ya juu ili kufanya punje moja ikue.",
    funnyQuote: "Nywele za mahindi sio za urembo tu, kila unywele ni mfereji wa kupitisha uzazi wa punje moja!",
    emoji: "🌽",
    iconName: "Activity"
  },
  {
    id: "fact_17",
    category: "mifugo",
    title: "Maziwa ya Mbuzi na Usagaji",
    fact: "Maziwa ya mbuzi yana chembechembe ndogo za mafuta kuliko maziwa ya ng'ombe, jambo linalofanya yawe rahisi kusagwa tumboni kwa haraka zaidi.",
    science: "Maziwa ya mbuzi yana mafuta yenye minyororo mifupi na ya kati (medium-chain fatty acids) ambayo hufyonzwa kwa urahisi zaidi na mfumo wa chakula, na pia yana mzio mdogo wa protini ya casein.",
    funnyQuote: "Tumbo lako linapenda maziwa ya mbuzi kwa sababu hayahitaji mjadala mrefu na mgumu ili kusagwa!",
    emoji: "🥛",
    iconName: "Activity"
  },
  {
    id: "fact_18",
    category: "mifugo",
    title: "Ulinzi wa Bata Wakati wa Kulala",
    fact: "Bata wana uwezo wa kulala wakiwa wamefumbua jicho moja na nusu ya ubongo wao ikiwa macho, hasa wale waliopo pembezoni mwa kundi.",
    science: "Hali hii inaitwa Single-hemispheric slow-wave sleep. Ubongo unajigawa ili nusu moja ipumzike na nusu nyingine ibaki chonjo kugundua maadui, kisha bata wanageuzana nafasi ili kutoa fursa kwa wote kupumzika.",
    funnyQuote: "Huyu ndio 'mwenyekiti wa ulinzi shirikishi' wa bandani, analala lakini jicho moja linakuchunguza usimle!",
    emoji: "🦆",
    iconName: "Eye"
  },
  {
    id: "fact_19",
    category: "maajabu",
    title: "Chakula Pekee Kisichooza",
    fact: "Asali halisi ya nyuki haina maji na ina asidi ya kutosha kuzuia bakteria kukua, na kuifanya isioze hata kwa miaka maelfu.",
    science: "Asali ina kiwango cha chini sana cha unyevu na pH asidi ya karibu 3.2 hadi 4.5. Pia nyuki huweka enzyme iitwayo glucose oxidase ambayo inazalisha hydrogen peroxide, kizuizi kikali cha maisha ya viini-tetemeko.",
    funnyQuote: "Asali ni chakula pekee cha asili ambacho hakihitaji jokofu wala tarehe ya mwisho ya matumizi (expiry date)!",
    emoji: "🍯",
    iconName: "Award"
  },
  {
    id: "fact_20",
    category: "pembejeo",
    title: "Internet ya Chini ya Udongo",
    fact: "Kuvu ya Mycorrhiza huungana na mizizi ya mimea na kuongeza eneo la kufyonza maji na virutubisho hadi mara 1,000, huku ikitengeneza mtandao mpana kama internet.",
    science: "Mycorrhizae hutoa nyuzi nyembamba (hyphae) zinazoenea mbali kuliko mizizi ya kawaida. Mtandao huu unaruhusu mimea kubadilishana virutubisho, maji na hata kutuma ishara za kikemikali za onyo endapo kuna wadudu.",
    funnyQuote: "Kabla ya fiber optic za makampuni ya simu, kuvu walishafunga internet ya kasi ya asili chini ya ardhi!",
    emoji: "🍄",
    iconName: "Zap"
  },
  {
    id: "fact_21",
    category: "mifugo",
    title: "Ng'ombe na Rada ya Hali ya Hewa",
    fact: "Ng'ombe wanaweza kusikia sauti za masafa ya chini sana na ya juu sana kuliko binadamu, na wanaweza kugundua dhoruba inayokuja mapema.",
    science: "Uwezo mkubwa wa masikio ya ng'ombe kusikia infra-sound (chini ya 20Hz) unawaruhusu kusikia sauti za upepo mkali, dhoruba, au hata mitetemo ya ardhi iliyopo umbali mkubwa sana.",
    funnyQuote: "Ng'ombe wako anajua mvua itanyesha kabla hata mamlaka ya hali ya hewa hawajamaliza kuandika ripoti!",
    emoji: "⛈️",
    iconName: "Activity"
  },
  {
    id: "fact_22",
    category: "mazao",
    title: "Kilio cha Nyanya Ukizikosesha Maji",
    fact: "Mimea ya nyanya hutoa milio ya sauti ya juu sana (ultrasonic clicks) ambayo binadamu hawezi kusikia wakati wanapokosa maji au wanapokatwa majani.",
    science: "Kupitia kifaa maalum cha kurekodia sauti, wanasayansi waligundua kuwa mimea iliyonyimwa maji hutoa milio ya sauti ya juu (frequencies kati ya 40-80kHz) kutokana na kupasuka kwa mapovu ya hewa kwenye mishipa yake ya maji (cavitation).",
    funnyQuote: "Ukiacha kumwagilia nyanya zako shambani, kiuhalisia zinakupigia kelele kimyakimya lakini kwa sauti kali sana!",
    emoji: "🍅",
    iconName: "Activity"
  },
  {
    id: "fact_23",
    category: "mazao",
    title: "Kiu Kubwa ya Kilimo cha Mpunga",
    fact: "Ili kuzalisha kilo moja tu ya mchele, mkulima anahitaji wastani wa lita 3,000 hadi 5,000 za maji ya umwagiliaji.",
    science: "Mpunga unahitaji maji mengi kwa sababu ya mfumo wake wa kibaolojia na hitaji la kuweka mashamba yakiwa na maji ili kuzuia magugu kukua na kudhibiti joto la udongo.",
    funnyQuote: "Kila sahani ya wali tamu unayokula imekunywa maji mengi kuliko wewe unavyoweza kunywa kwa miezi miwili!",
    emoji: "🌾",
    iconName: "Calendar"
  },
  {
    id: "fact_24",
    category: "maajabu",
    title: "Ndege Hawasikii Ukali wa Pilipili",
    fact: "Dutu inayofanya pilipili iwe kali (capsaicin) haifanyi kazi kwa ndege kwa sababu hawana vipokezi maalum vya joto mdomoni.",
    science: "Capsaicin hufanya kazi kwa kujifunga kwenye vipokezi vya joto vya TRPV1 vilivyopo kwa mamalia. Ndege hawana vipokezi hivi vyenye usikivu huo, hivyo wanaweza kula pilipili na kueneza mbegu zake kupitia kinyesi bila maumivu.",
    funnyQuote: "Bundi au kuku anaweza kula pilipili kichaa kama pipi laini, huku wewe ukilia machozi na kunywa maziwa ya baridi!",
    emoji: "🌶️",
    iconName: "Shield"
  },
  {
    id: "fact_25",
    category: "pembejeo",
    title: "Majivu ya Jikoni kama Kirutubisho",
    fact: "Majivu ya kuni yana madini mengi ya Potassium na Calcium, na hutumiwa kupunguza ukali wa udongo wenye asidi na kufukuza konokono.",
    science: "Ash ina carbonate ambayo huongeza pH ya udongo (kupunguza asidi) sawa na chokaa ya kilimo. Pia chembechembe zake kali na kavu hufyonza unyevu kutoka kwa konokono na kuwaua.",
    funnyQuote: "Usitupe majivu ya jikoni baada ya kupika kwa kuni, bustani yako inayachukulia kama unga wa protini wa kiwango cha juu!",
    emoji: "🔥",
    iconName: "Zap"
  },
  {
    id: "fact_26",
    category: "mazao",
    title: "Mchaichai kama Kinga ya Mbu",
    fact: "Mchaichai una mafuta asilia ya citronella ambayo ni adui mkubwa wa mbu na wadudu wengine wanaoruka.",
    science: "Citronella hufanya kazi ya kufunika harufu ya jasho na carbon dioxide inayotolewa na binadamu au wanyama, jambo linalofanya mbu wasiweze kukutambua au kukaribia mmea huo.",
    funnyQuote: "Kunywa chai ya mchaichai huku ukiwa umeweka mche mmoja mlangoni, mbu wote watahamia kwa jirani!",
    emoji: "🌱",
    iconName: "Shield"
  },
  {
    id: "fact_27",
    category: "maajabu",
    title: "Mbuzi Waliogundua Kahawa",
    fact: "Kugundulika kwa kahawa kunasemekana kulisababishwa na mbuzi nchini Ethiopia ambao walionekana kuchangamka sana baada ya kula matunda ya mti wa kahawa.",
    science: "Mchungaji wa karne ya 9 aitwaye Kaldi aliona mbuzi wake wakicheza kwa nguvu na kukosa usingizi baada ya kula matunda mekundu ya kahawa (caffeine), jambo lililopelekea utengenezaji wa kinywaji hiki duniani.",
    funnyQuote: "Mshukuru mbuzi yule wa Ethiopia kwa ajili ya kikombe chako kizuri cha kahawa cha kila asubuhi leo!",
    emoji: "☕",
    iconName: "Brain"
  },
  {
    id: "fact_28",
    category: "mazao",
    title: "Benki ya Chakula ya Viazi Vitamu",
    fact: "Viazi vitamu vikiachwa ardhini baada ya kukomaa vinaweza kuendelea kuhifadhi chakula na kuwa vikubwa bila kuharibika.",
    science: "Tofauti na nafaka, viazi vitamu vina uwezo wa kuhifadhiwa ardhini (in-ground storage) kwa miezi kadhaa bila kupoteza ubora wake vya virutubisho, kwani udongo huwalinda na mabadiliko ya hali ya hewa.",
    funnyQuote: "Viazi vitamu ni kama akaunti ya siri ya akiba ardhini, unachimba tu pale unapopata njaa au unapotaka hela ya haraka!",
    emoji: "🍠",
    iconName: "Calendar"
  }
];

export default function UlikuwaUnajua() {
  const [activeCategory, setActiveCategory] = useState<string>("zote");
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem("wakulima_fact_likes") || "{}");
    } catch {
      return {};
    }
  });
  const [liked, setLiked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("wakulima_fact_liked") || "{}");
    } catch {
      return {};
    }
  });

  // Filter facts based on category
  const filteredFacts = FARMING_FACTS.filter(
    f => activeCategory === "zote" || f.category === activeCategory
  );

  // Safely get active fact
  const activeFact = filteredFacts[currentFactIndex % filteredFacts.length] || FARMING_FACTS[0];

  const handleNextFact = () => {
    setShowExplanation(false);
    setCurrentFactIndex((prev) => (prev + 1) % filteredFacts.length);
  };

  const handlePrevFact = () => {
    setShowExplanation(false);
    setCurrentFactIndex((prev) => (prev - 1 + filteredFacts.length) % filteredFacts.length);
  };

  const handleLike = (factId: string) => {
    const isAlreadyLiked = liked[factId];
    const newLiked = { ...liked, [factId]: !isAlreadyLiked };
    const currentFactLikes = likes[factId] !== undefined ? likes[factId] : getStartingLikes(factId);
    const newLikes = { 
      ...likes, 
      [factId]: isAlreadyLiked ? currentFactLikes - 1 : currentFactLikes + 1 
    };

    setLiked(newLiked);
    setLikes(newLikes);
    localStorage.setItem("wakulima_fact_liked", JSON.stringify(newLiked));
    localStorage.setItem("wakulima_fact_likes", JSON.stringify(newLikes));
  };

  const handleShare = (fact: Fact) => {
    const text = `*Ulikuwa unajua?* 😮\n\n"${fact.fact}"\n\nSoma zaidi na uunganishe na soko la wakulima hapa: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: fact.title,
        text: text,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(text);
      alert("Mada imenakiliwa kwenye simu yako! Unaweza kuituma WhatsApp au SMS.");
    }
  };

  const currentLikesCount = likes[activeFact.id] !== undefined 
    ? likes[activeFact.id] 
    : getStartingLikes(activeFact.id);

  return (
    <div id="ulikuwa-unajua-main-card" className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl border-2 border-emerald-500/20 max-w-4xl mx-auto">
      
      {/* Background decorations */}
      <div className="absolute right-0 bottom-0 top-0 opacity-5 pointer-events-none flex items-center justify-center">
        <span className="text-[14rem] select-none">{activeFact.emoji}</span>
      </div>
      <div className="absolute top-10 left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Category Quick Filter */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Darasa la Burudani & Elimu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center mt-1">
            <Lightbulb className="h-5.5 w-5.5 text-orange-400 mr-2 animate-bounce" />
            Ulikuwa Unajua? (Did You Know?)
          </h2>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
          {[
            { id: "zote", label: "Zote" },
            { id: "mifugo", label: "Mifugo 🐄" },
            { id: "mazao", label: "Mazao 🌽" },
            { id: "pembejeo", label: "Pembejeo 🧪" },
            { id: "maajabu", label: "Maajabu 💡" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentFactIndex(0);
                setShowExplanation(false);
              }}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeCategory === cat.id 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "text-emerald-100/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Fact Card Display */}
      <div className="relative z-10 py-6 sm:py-8 min-h-[220px] flex flex-col justify-between space-y-6">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300" key={activeFact.id}>
          {/* Fact Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
              {activeFact.category === "mifugo" ? "Ufugaji na Wanyama" : activeFact.category === "mazao" ? "Kilimo na Mazao" : activeFact.category === "pembejeo" ? "Mbolea na Dawa" : "Maajabu ya Dunia"}
            </span>
            <span className="text-2xl">{activeFact.emoji}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {activeFact.title}
          </h3>

          {/* Core Fact Text */}
          <p className="text-sm sm:text-base font-medium leading-relaxed text-emerald-50 bg-emerald-900/40 p-4.5 rounded-2xl border border-emerald-800/50 shadow-inner">
            &quot;{activeFact.fact}&quot;
          </p>

          {/* Fun / Humorous quote */}
          <div className="border-l-4 border-orange-400 pl-4 py-1 italic text-xs text-orange-200/90 font-medium">
            Kicheko: {activeFact.funnyQuote}
          </div>

          {/* Interactive Toggle for scientific reasoning */}
          <div className="pt-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showExplanation ? "Ficha maelezo ya sayansi" : "Gundua sayansi na sababu yake gundua hapa..."}</span>
              <ChevronRight className={`h-3 w-3 transform transition-transform ${showExplanation ? "rotate-90" : ""}`} />
            </button>

            {showExplanation && (
              <div className="mt-3 p-4 bg-emerald-950/80 border border-emerald-800/60 rounded-2xl text-[11px] leading-relaxed font-semibold text-emerald-100/90 animate-in slide-in-from-top-2 duration-200">
                <span className="text-orange-300 font-black block uppercase tracking-wider mb-1">Mbona iko hivi? (Ufafanuzi wa Kisayansi)</span>
                {activeFact.science}
              </div>
            )}
          </div>
        </div>

        {/* Fact Footer actions and paging */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4.5">
          
          {/* Reaction Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLike(activeFact.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-black cursor-pointer ${
                liked[activeFact.id] 
                  ? "bg-red-500/20 text-red-300 border-red-500/40" 
                  : "bg-white/5 text-emerald-100/80 border-white/10 hover:bg-white/10"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked[activeFact.id] ? "fill-red-500 text-red-500 animate-pulse" : ""}`} />
              <span>{currentLikesCount} Wamependa</span>
            </button>

            <button
              onClick={() => handleShare(activeFact)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-emerald-100/80 text-xs font-black transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Sajili / Tuma WhatsApp</span>
            </button>
          </div>

          {/* Carousel Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-mono font-bold text-emerald-400 mr-2">
              {currentFactIndex + 1} kati ya {filteredFacts.length}
            </span>

            <button
              onClick={handlePrevFact}
              className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Fact iliyopita"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>

            <button
              onClick={handleNextFact}
              className="flex items-center justify-center space-x-1.5 px-4.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-orange-500/20"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Fact Nyingine</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

// In-line dynamic "Did You Know" card component that shows up as you scroll down listings
export function InLineFactCard({ factIndex = 0 }: { factIndex?: number; key?: React.Key }) {
  // Get fact deterministically based on seed index
  const fact = FARMING_FACTS[factIndex % FARMING_FACTS.length];

  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    try {
      const likedMap = JSON.parse(localStorage.getItem("wakulima_fact_liked") || "{}");
      return !!likedMap[fact.id];
    } catch {
      return false;
    }
  });

  const [likesCount, setLikesCount] = useState<number>(() => {
    try {
      const likesMap = JSON.parse(localStorage.getItem("wakulima_fact_likes") || "{}");
      if (likesMap[fact.id] !== undefined) {
        return likesMap[fact.id];
      }
    } catch {}
    return getStartingLikes(fact.id);
  });

  // Keep in sync with other updates to likes on mount/id change
  useEffect(() => {
    try {
      const likedMap = JSON.parse(localStorage.getItem("wakulima_fact_liked") || "{}");
      setHasLiked(!!likedMap[fact.id]);

      const likesMap = JSON.parse(localStorage.getItem("wakulima_fact_likes") || "{}");
      if (likesMap[fact.id] !== undefined) {
        setLikesCount(likesMap[fact.id]);
      } else {
        setLikesCount(getStartingLikes(fact.id));
      }
    } catch {}
  }, [fact.id]);

  const handleLikeClick = () => {
    const isNowLiked = !hasLiked;
    setHasLiked(isNowLiked);
    const newCount = isNowLiked ? likesCount + 1 : likesCount - 1;
    setLikesCount(newCount);

    try {
      const likedMap = JSON.parse(localStorage.getItem("wakulima_fact_liked") || "{}");
      likedMap[fact.id] = isNowLiked;
      localStorage.setItem("wakulima_fact_liked", JSON.stringify(likedMap));

      const likesMap = JSON.parse(localStorage.getItem("wakulima_fact_likes") || "{}");
      likesMap[fact.id] = newCount;
      localStorage.setItem("wakulima_fact_likes", JSON.stringify(likesMap));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 text-white rounded-3xl p-5.5 shadow-xl shadow-orange-500/5 flex flex-col justify-between space-y-4 relative overflow-hidden group border-2 border-orange-300/30 col-span-1 sm:col-span-2 lg:col-span-3 min-h-[220px]">
      {/* Absolute faint background icon */}
      <div className="absolute right-2 bottom-2 text-7xl opacity-10 select-none group-hover:scale-110 transition-transform">
        {fact.emoji}
      </div>

      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 bg-orange-950/20 px-2.5 py-1 rounded-full border border-orange-300/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-100">Ulikuwa Unajua?</span>
          </div>
          <span className="text-xl">{fact.emoji}</span>
        </div>

        <h4 className="text-xs font-black uppercase tracking-widest text-orange-100">
          {fact.title}
        </h4>
        
        <p className="text-xs font-bold leading-relaxed text-white">
          &quot;{fact.fact}&quot;
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-orange-300/30 relative z-10">
        <button 
          onClick={handleLikeClick}
          className={`flex items-center space-x-1 text-[10px] font-black bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            hasLiked ? "bg-white/20 border border-white/20 text-red-200" : ""
          }`}
        >
          <Heart className={`h-3 w-3 ${hasLiked ? "fill-red-500 text-red-500 animate-pulse" : ""}`} />
          <span>{likesCount} Likes</span>
        </button>

        <span className="text-[9px] font-mono font-bold text-orange-950 bg-white/25 px-2 py-0.5 rounded-md">
          Elimu Sifuri Kabisa!
        </span>
      </div>
    </div>
  );
}
