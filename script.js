// --- START OF FILE script.js.txt ---
window.onload = function() {

// 1. Firebase कॉन्फ़िगरेशन पेस्ट करें (अपनी असली कीज़ यहाँ डालें)
const firebaseConfig = {
  apiKey: "AIzaSy...", // <<<--- यहाँ अपनी KEY डालें
  authDomain: "your-project.firebaseapp.com", // <<<--- यहाँ अपनी KEY डालें
  databaseURL: "https://your-project-default-rtdb.firebaseio.com", // <<<--- यहाँ अपनी KEY डालें
  projectId: "your-project", // <<<--- यहाँ अपनी KEY डालें
  storageBucket: "your-project.appspot.com", // <<<--- यहाँ अपनी KEY डालें
  messagingSenderId: "1234567890", // <<<--- यहाँ अपनी KEY डालें
  appId: "1:12345:web:abcdef" // <<<--- यहाँ अपनी KEY डालें
};

// 2. Firebase को इनिशियलाइज़ करें
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const drawStatusRef = database.ref('draw/status'); // यह वह 'पता' है जिसे हम सुनेंगे



// --- स्प्लैश स्क्रीन को छिपाने का लॉजिक ---
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
    }, 6000); // 5 सेकंड का समय
});

// ********** यहाँ अपना DEPLOYED Apps Script URL डालें (जो /exec पर समाप्त होता है) **********
const API_URL = 'https://script.google.com/macros/s/AKfycbz2tIumCHYpvaRyFXiceh_qd4R-d45Dj9wV-27IQ5QzFjd1Kx5KFLY7u8MzMpqbEVbIMg/exec';

// --- रील और UI एलिमेंट्स ---
const subtitleText = document.getElementById('subtitle-text');
const drawButton = document.getElementById('draw-button');
const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('role');

// अगर यूज़र एडमिन नहीं है, तो ड्रॉ बटन छिपा दें
if (userRole !== 'admin') {
    drawButton.style.display = 'none';
}
const langHi = document.getElementById('lang-hi');
const langEn = document.getElementById('lang-en');
const searchHeading = document.getElementById('search-heading');
const searchSubheading = document.getElementById('search-subheading');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResultContainer = document.getElementById('search-result-container');
const winnerBanner = document.querySelector('.winner-banner');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const rotatingWipe = document.getElementById('rotating-wipe');
const tickSound = document.getElementById('tick-sound');
const staticSound = document.getElementById('static-sound');
const filmBurnOverlay = document.getElementById('film-burn-overlay');
const reelCoupon = document.getElementById('reel-coupon'); // केवल कूपन कोड रील

// --- नया Popup UI ---
const winnerPopupOverlay = document.getElementById('winner-popup-overlay');
const popupHeading = document.getElementById('popup-heading');
const prizeImage = document.getElementById('prize-image');
const popupName = document.getElementById('popup-name');
const popupCoupon = document.getElementById('popup-coupon');
const popupOutlet = document.getElementById('popup-outlet');
const popupMobile = document.getElementById('popup-mobile');
const saveNextButton = document.getElementById('save-next-button');

const ITEM_HEIGHT = 100; // CSS से मेल खाता है (reel-item की हाइट)
const REEL_LENGTH = 1000;
let allParticipants = [];
let currentWinner = null; // वर्तमान विजेता का डेटा स्टोर करने के लिए
let currentRound = 1;
const totalRounds = 26;

// --- राउंड और प्राइज़ का कॉन्फ़िगरेशन ---
const prizeConfig = [
    { range: [1, 20], prize: "Dinner Set", image: "Prizeimages/prize_dinner_set.jpg" },
    { range: [21, 23], prize: "LED TV", image: "Prizeimages/prize_led_tv.jpeg" },
    { range: [24, 25], prize: "Refrigerator", image: "Prizeimages/prize_fridge.png" },
    { range: [26, 26], prize: "Motorcycle (Mega Prize)", image: "Prizeimages/prize_bike.png" }
];

function getPrizeDetails(round) {
    return prizeConfig.find(config => round >= config.range[0] && round <= config.range[1]);
}

const translations = {
    hi: { subtitle: "दिवाली स्पेशल लकी ड्रा", button: "विजेता चुनें!", winner_title: "विजेता", tab_winner: "परिणाम पेज", tab_participants: "हमारे बारे में", search_heading: "अपनी एंट्री जांचें", search_subheading: "अपनी एंट्री खोजने के लिए अपना मोबाइल नंबर या कूपन कोड दर्ज करें।", search_placeholder: "मोबाइल या कूपन कोड दर्ज करें...", search_button: "खोजें", searching: "खोज रहे हैं...", entry_found: "बधाई हो! आपकी एंट्री मिल गई है।", no_entry: "इस विवरण के साथ कोई एंट्री नहीं मिली।", empty_input: "कृपया खोजने के लिए कुछ दर्ज करें।", about_heading: "उत्कृष्टता के प्रति हमारी प्रतिबद्धता", about_p1: "हिंदुस्तान पेट्रोलियम कॉर्पोरेशन लिमिटेड (एचपीसीएल) भारत की अग्रणी तेल और गैस कंपनियों में से एक है...", about_p2: "यह लकी ड्रा एचपीसीएल को चुनने के लिए आपका धन्यवाद कहने का हमारा तरीका है..." },
    en: { subtitle: "Diwali Special Lucky Draw", button: "Reveal the Winner", winner_title: "Winner", tab_winner: "Result Page", tab_participants: "About Us", search_heading: "Check Your Coupen Code", search_subheading: "Enter your Mobile Number or Coupon Code to find your entry.", search_placeholder: "Enter Mobile or Coupon Code...", search_button: "Search", searching: "Searching...", entry_found: "Congratulations! Your entry has been found.", no_entry: "No entry found with these details.", empty_input: "Please enter something to search.", about_heading: "Our Commitment to Excellence", about_p1: "Hindustan Petroleum Corporation Limited (HPCL) is one of India's leading oil and gas companies...", about_p2: "This lucky draw is our way of saying thank you for choosing HPCL..." }
};
let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    subtitleText.innerText = t.subtitle;
    drawButton.innerText = t.button;
    document.getElementById('tab-btn-winner').innerText = t.tab_winner;
    document.getElementById('tab-btn-participants').innerText = t.tab_participants;
    searchHeading.innerText = t.search_heading;
    searchSubheading.innerText = t.search_subheading;
    searchInput.placeholder = t.search_placeholder;
    searchButton.innerText = t.search_button;
    document.getElementById('about-heading').innerText = t.about_heading;
    document.getElementById('about-p1').innerText = t.about_p1;
    document.getElementById('about-p2').innerText = t.about_p2;
    langHi.classList.toggle('active', lang === 'hi');
    langEn.classList.toggle('active', lang === 'en');
}

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // सभी प्रतिभागियों के लिए 'isWinner' फ्लैग जोड़ें
        allParticipants = data.map(p => ({ ...p, isWinner: false, prize: null })); 
        subtitleText.innerText = `Ready for Round ${currentRound}/${totalRounds}: ${getPrizeDetails(currentRound).prize}`;
        console.log("Data loaded successfully.");
    } catch (error) {
        console.error('Data loading error:', error);
        searchResultContainer.innerHTML = `<div class="result-message error">Could not connect to the server.</div>`;
    }
}

function searchParticipant() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) { searchResultContainer.innerHTML = `<div class="result-message error">${translations[currentLang].empty_input}</div>`; return; }
    searchResultContainer.innerHTML = `<div class="result-message">${translations[currentLang].searching}</div>`;
    setTimeout(() => {
        const result = allParticipants.find(p => (p['CustomerPhone'] && String(p['CustomerPhone']) === searchTerm) || (p['CouponCode'] && p['CouponCode'] === searchTerm));
        if (result) {
            const customerName = result['CustomerName'] || 'N/A';
            const customerPhone = result['CustomerPhone'] || 'N/A';
            const vehicleNumber = result['VehicleNumber'] || 'N/A';
            const couponCode = result['CouponCode'] || 'N/A';
            const pumpName = result['PumpName'] || 'N/A'; 
            searchResultContainer.innerHTML = `<div class="result-message success">${translations[currentLang].entry_found}</div><div class="result-card"><p><strong>Outlet Name:</strong> ${pumpName}</p><p><strong>Customer Name:</strong> ${customerName}</p><p><strong>Mobile Number:</strong> ${customerPhone.toString().substring(0, 2) + '******' + customerPhone.toString().substring(customerPhone.toString().length - 2)}</p><p><strong>Vehicle Number:</strong> ${vehicleNumber}</p><p><strong>Coupon Code:</strong> ${couponCode}</p></div>`;
        } else {
            searchResultContainer.innerHTML = `<div class="result-message error">${translations[currentLang].no_entry}</div>`;
        }
    }, 500);
}

// --- रील इनिशियलाइज़ेशन (केवल कूपन कोड रील) ---
function initializeReels() {
    const defaultText = '<div class="reel-item">READY TO DRAW</div>';
    reelCoupon.innerHTML = defaultText;
    reelCoupon.style.transform = 'translateY(0px)';
    
    // रील बॉक्स के बॉर्डर को रीसेट करें
    document.querySelectorAll('.reel-box').forEach(box => {
        box.style.border = '3px solid #FFD700';
    });
}


// --- स्लॉट मशीन लॉजिक ---

function startContinuousReel(reelElement, participantsArray, key, speed) {
    
    const REEL_LOOP_COUNT = 10;
    const SINGLE_PASS_LENGTH = REEL_LENGTH / REEL_LOOP_COUNT; 
    let entriesHtml = '';
    
    for (let loop = 0; loop < REEL_LOOP_COUNT; loop++) {
        for (let i = 0; i < SINGLE_PASS_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * participantsArray.length);
            const participant = participantsArray[randomIndex];
            
            let displayValue = participant[key] || 'N/A';

            if (key === 'CustomerPhone' && displayValue) {
                displayValue = displayValue.toString();
                displayValue = displayValue.substring(0, 2) + '******' + displayValue.substring(displayValue.length - 2);
            }
            
            entriesHtml += `<div class="reel-item">${displayValue}</div>`;
        }
    }
    
    reelElement.innerHTML = entriesHtml;
    
    const rollDistance = REEL_LENGTH * ITEM_HEIGHT; 
    
    reelElement.style.transition = 'none';
    reelElement.style.transform = `translateY(0px)`; 

    reelElement.style.transition = `transform ${speed}s linear`;
    reelElement.style.transform = `translateY(-${rollDistance}px)`; 
    
    return { reelElement, rollDistance, speed }; 
}


function stopReel(reelObject, finalValue, stopTimeInSeconds, delayTime) {
    const { reelElement } = reelObject;
    
    const FINAL_POS_INDEX = 800; 
    
    let newEntriesHtml = '';
    let items = reelElement.querySelectorAll('.reel-item');
    
    for (let i = 0; i < items.length; i++) {
        if (i === FINAL_POS_INDEX) {
            newEntriesHtml += `<div class="reel-item final-winner">${finalValue}</div>`;
        } else {
            newEntriesHtml += items[i].outerHTML;
        }
    }
    reelElement.innerHTML = newEntriesHtml;
    
    const finalScrollPosition = FINAL_POS_INDEX * ITEM_HEIGHT; 

    setTimeout(() => {
        reelElement.style.transition = `transform ${stopTimeInSeconds}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        reelElement.style.transform = `translateY(-${finalScrollPosition}px)`; 
        
        setTimeout(() => {
            reelElement.parentElement.parentElement.style.border = '3px solid #d9232d'; 
        }, stopTimeInSeconds * 1000);
    }, delayTime);
}

// --- मुख्य ड्रॉ फंक्शन ---
function startDraw() {
    if (currentRound > totalRounds) {
        alert("All " + totalRounds + " rounds are complete! No more draws.");
        drawButton.disabled = true;
        return;
    }
    if (allParticipants.length === 0) {
        alert("Data not loaded yet or no participants available.");
        return;
    }
    
    // विजेता के रूप में चुने गए प्रतिभागियों को हटा दें
    const unselectedParticipants = allParticipants.filter(p => !p.isWinner);
    if (unselectedParticipants.length === 0) {
        alert("No remaining participants to draw from!");
        return;
    }
    
    drawButton.disabled = true;
    const prizeDetail = getPrizeDetails(currentRound);
    
    // राउंड और प्राइज़ का मैसेज दिखाएँ
    subtitleText.innerText = `Round ${currentRound}/${totalRounds}: Revealing for a ${prizeDetail.prize}`;
    
    // 1. काउंटडाउन ओवरले दिखाएं
    countdownOverlay.classList.remove('slide-down', 'hidden'); 
    runCountdown(10); 
}

// --- काउंटडाउन को चलाने वाला फंक्शन ---
function runCountdown(currentNumber) {
    const animClass = 'animate';
    const countdownInterval = 1200;

    if (currentNumber < 1) {
        countdownNumber.innerText = 'GO!';
        countdownNumber.style.fontSize = '30vmin';
        
        if (tickSound) { tickSound.currentTime = 0; tickSound.play(); }
        rotatingWipe.classList.remove(animClass);
        void rotatingWipe.offsetWidth;
        rotatingWipe.classList.add(animClass);
        
        setTimeout(() => {
              countdownOverlay.classList.add('slide-down');
            winnerBanner.classList.add('zoomed-in');

            setTimeout(beginReelSpin, 600); 

        }, countdownInterval);
        return;
    }

    countdownNumber.innerText = currentNumber;
    countdownNumber.style.fontSize = '40vmin';
    
    if (tickSound) { tickSound.currentTime = 0; tickSound.play(); }
    
    rotatingWipe.classList.remove(animClass);
    void rotatingWipe.offsetWidth; 
    rotatingWipe.classList.add(animClass);

    setTimeout(() => {
        runCountdown(currentNumber - 1);
    }, countdownInterval);
}

// --- रील स्पिनिंग लॉजिक (केवल 1 रील) ---
function beginReelSpin() {
    
    const unselectedParticipants = allParticipants.filter(p => !p.isWinner);

    const finalWinnerIndexInUnselected = Math.floor(Math.random() * unselectedParticipants.length);
    const winner = unselectedParticipants[finalWinnerIndexInUnselected];
    
    // विजेता को allParticipants में mark करें ताकि वह दोबारा न चुना जाए
    const originalIndex = allParticipants.findIndex(p => p.CouponCode === winner.CouponCode);
    allParticipants[originalIndex].isWinner = true;
    allParticipants[originalIndex].prize = getPrizeDetails(currentRound).prize;
    
    currentWinner = allParticipants[originalIndex]; // ग्लोबल विजेता वैरिएबल सेट करें
    
    document.getElementById('background-music').volume = 0.2;
    document.getElementById('draw-sound').play();
    
    const ROLL_SPEED = 10;
    let couponReel = startContinuousReel(reelCoupon, unselectedParticipants, 'CouponCode', ROLL_SPEED);
    
    const STOP_DURATION = 5; 
    let stopDelay = 5000;

    setTimeout(() => {
        stopReel(couponReel, winner['CouponCode'], STOP_DURATION, 100);
        
        setTimeout(() => {
            document.getElementById('draw-sound').pause();
            announceWinner(winner);
        }, STOP_DURATION * 1000 + 500); 
        
    }, stopDelay);
}


// --- विजेता डेटा को Google Sheet में सहेजने का कोड ---
async function saveWinnerData(winner) {
    try {
        // विजेता के डेटा में राउंड और पुरस्कार जोड़ें
        const winnerDataWithPrize = { ...winner, Round: currentRound, Prize: winner.prize };
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(winnerDataWithPrize)
        });

        const result = await response.json();
        if (result.status === 'success') {
            return true;
        } else {
            console.error('ERROR: Could not save winner data to sheet:', result.message);
            return false;
        }
    } catch (error) {
        console.error('NETWORK ERROR: Could not connect to Apps Script POST endpoint.', error);
        return false;
    }
}

// --- विजेता घोषणा और UI नियंत्रण ---
function announceWinner(winner) {
    const prizeDetail = getPrizeDetails(currentRound);
    
    // पॉपअप UI भरें
    popupHeading.innerText = `Congratulations! ${winner.CustomerName} is the Winner!`;
    prizeImage.src = prizeDetail.image;
    popupName.innerText = winner.CustomerName;
    popupCoupon.innerText = winner.CouponCode;
    popupOutlet.innerText = winner.PumpName;
    let mobileDisplay = winner.CustomerPhone.toString();
    popupMobile.innerText = mobileDisplay.substring(0, 2) + '******' + mobileDisplay.substring(mobileDisplay.length - 2);

    // पॉपअप दिखाएँ
    winnerPopupOverlay.classList.remove('hidden'); 
    
    // ऑडियो और इफ़ेक्ट
    document.getElementById('winner-sound').play(); 
    document.getElementById('background-music').volume = 1.0; 

    if (typeof confetti === 'function') {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
    }
    
    winnerBanner.classList.remove('zoomed-in');
    
    // बटन को सेव करने के लिए तैयार करें
    saveNextButton.innerText = `Save Winner & Ready for Round ${currentRound + 1}`;
    saveNextButton.disabled = false; // सुनिश्चित करें कि यह सक्षम है
}


// --- इवेंट लिसनर ---
saveNextButton.addEventListener('click', async () => {
    if (currentWinner) {
        saveNextButton.disabled = true;
        saveNextButton.innerText = 'Saving... Please Wait...';
        
        const isSaved = await saveWinnerData(currentWinner);
        
        if (isSaved) {
            winnerPopupOverlay.classList.add('hidden');
            
            // अगले राउंड के लिए तैयारी करें
            currentRound++;
            currentWinner = null;
            initializeReels(); 

            if (currentRound <= totalRounds) {
                const nextPrize = getPrizeDetails(currentRound).prize;
                subtitleText.innerText = `Ready for Round ${currentRound}/${totalRounds}: ${nextPrize}`;
                drawButton.disabled = false;
            } else {
                subtitleText.innerText = `All ${totalRounds} Rounds Complete!`;
                drawButton.disabled = true;
            }

        } else {
            alert("Error saving winner data. Please check console and try again.");
            saveNextButton.disabled = false;
            saveNextButton.innerText = `Save Winner & Ready for Round ${currentRound + 1}`;
        }
    }
});


// --- इनीशियलाइज़ेशन ---
setLanguage('en');
fetchData();
initializeReels(); 
function handleAdminClick() {
    // Firebase को सिग्नल भेजें कि ड्रॉ शुरू करना है
    drawStatusRef.set('started')
        .then(() => {
            console.log("ड्रॉ शुरू करने का सिग्नल भेजा गया!");
        })
        .catch(error => {
            console.error("सिग्नल भेजने में विफल: ", error);
        });
}

// एडमिन के लिए नया क्लिक इवेंट
if (userRole === 'admin') {
    drawButton.addEventListener('click', handleAdminClick);
}
langHi.addEventListener('click', (e) => { e.preventDefault(); setLanguage('hi'); });
langEn.addEventListener('click', (e) => { e.preventDefault(); setLanguage('en'); });
searchButton.addEventListener('click', searchParticipant);

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        const targetTab = button.getAttribute('data-tab');
        const targetPanel = document.querySelector(`.tab-panel[data-tab="${targetTab}"]`);
        if (targetPanel) { targetPanel.classList.add('active'); }
        if (targetTab === 'winner') {
            winnerBanner.style.display = 'block'; 
        } else {
            winnerBanner.style.display = 'none';
        }
    });
})

// Firebase डेटाबेस में बदलावों को लगातार सुनें
drawStatusRef.on('value', (snapshot) => {
    const status = snapshot.val();
    
    // अगर एडमिन ने सिग्नल 'started' भेजा है, तो ड्रॉ शुरू करें!
    if (status === 'started') {
        console.log("सिग्नल मिला! ड्रॉ शुरू हो रहा है...");
        startDraw(); // यह सभी दर्शकों के लिए ड्रॉ शुरू कर देगा
        
        // (वैकल्पिक) एडमिन के ब्राउज़र से स्टेटस को रीसेट करें ताकि दोबारा न चले
        if (userRole === 'admin') {
            setTimeout(() => {
                drawStatusRef.set('finished'); 
            }, 30000); // 30 सेकंड बाद रीसेट करें
        }
    }
});
};
// --- END OF FILE script.js.txt ---