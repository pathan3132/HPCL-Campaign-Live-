const firebaseConfig = {
    apiKey: "AIzaSyCAKoW_qCM9gF9k_vFvLOOpDORsFAfOgOQ",
    authDomain: "hpcl-campaign-live.firebaseapp.com",
    databaseURL: "https://hpcl-campaign-live-default-rtdb.firebaseio.com",
    projectId: "hpcl-campaign-live",
    storageBucket: "hpcl-campaign-live.firebasestorage.app",
    messagingSenderId: "843304288801",
    appId: "1:843304288801:web:3130a50baad7efa427d960",
    measurementId: "G-CDQDF0Z040"
};

// Firebase को शुरू करें
firebase.initializeApp(firebaseConfig);
const appCheck = firebase.appCheck();
appCheck.activate(
    '6LcWPgwsAAAAABmtXNz6XlIH_gAysJictdngUHKY',
    true
);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');
    if (userRole === 'admin' && !user) {
        console.log("Admin access denied. Redirecting to login page.");
        window.location.href = 'admin_login.html';
    }
});

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS4ReuKp0Evds7Ttj-tHQ0AhaEGuXZih1UnnKgtvXz9oN7bvF1uNqCezNpyKmnYZsQsA/exec';

const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('role');
const salesArea = urlParams.get('area');

if (!salesArea) {
    document.body.innerHTML = `<h1 style="color: white; text-align:center; margin-top: 50px;">Sales Area Not Specified. Please add '?area=your_area_name' to the URL.</h1>`;
    throw new Error("Sales Area not specified in URL.");
}

const salesAreaRef = db.collection(salesArea);
const gameStateRef = salesAreaRef.doc('drawState');
const winnersRef = salesAreaRef.doc('data').collection('winners');
const participantsRef = salesAreaRef.doc('data').collection('participants');

console.log("Searching for data in area:", salesArea);
console.log("Full database path being checked:", participantsRef.toString());

let isMuted = false;
let areSoundsPrimed = false;
const countdownSound = document.getElementById('sound-countdown');
const revealSound = document.getElementById('sound-reveal');
const spinSound = document.getElementById('sound-spin');
const winnerSound = document.getElementById('sound-winner');
const celebrateSound = document.getElementById('sound-celebrate');
const backgroundMusic = document.getElementById('sound-background');
const allSounds = [countdownSound, revealSound, spinSound, winnerSound, celebrateSound, backgroundMusic];
const muteButton = document.getElementById('mute-button');
const muteIcon = document.getElementById('mute-icon');
const unmuteIcon = document.getElementById('unmute-icon');

// --- DOM एलिमेंट्स ---
const subtitleText = document.getElementById('subtitle-text');
const drawButton = document.getElementById('draw-button');
const thankYouPopupOverlay = document.getElementById('thank-you-popup-overlay');
const closeThankYouPopupButton = document.getElementById('close-thank-you-popup');
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
const reelCoupon = document.getElementById('reel-coupon');
const winnerPopupOverlay = document.getElementById('winner-popup-overlay');
const popupHeading = document.getElementById('popup-heading');
const prizeImage = document.getElementById('prize-image');
const popupName = document.getElementById('popup-name');
const popupCoupon = document.getElementById('popup-coupon');
const popupOutlet = document.getElementById('popup-outlet');
const popupAddress = document.getElementById('popup-address');
const popupMobile = document.getElementById('popup-mobile');
let saveNextButton = document.getElementById('save-next-button');
const resetButton = document.getElementById('reset-button');
const publicWinnerCard = document.getElementById('public-winner-card');
const publicHeading = document.getElementById('public-heading');
const publicPrizeImage = document.getElementById('public-prize-image');
const publicName = document.getElementById('public-name');
const publicCoupon = document.getElementById('public-coupon');
const publicOutlet = document.getElementById('public-outlet');
const publicAddress = document.getElementById('public-address');
const publicMobile = document.getElementById('public-mobile');
const countdownContainer = document.getElementById('countdown-container');
const drawLiveMessage = document.getElementById('draw-live-message');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const tabBtnParticipants = document.getElementById('tab-btn-participants');
const tabBtnWinner = document.getElementById('tab-btn-winner');
let pastWinnersMap = {}; 
const roundsGridContainer = document.getElementById('rounds-grid-container');
const roundsGrid = document.getElementById('rounds-grid');
const activeDrawView = document.getElementById('active-draw-view');
const backToGridBtn = document.getElementById('back-to-grid-btn');
const liveIndicatorText = document.getElementById('live-indicator-text');
const countdownTargetDate = new Date("2025-11-14T12:00:00");

// 1. ट्रैकिंग वेरिएबल्स
let isUserWatchingLive = false; 
let lastNotifiedRound = 0;      
let isReplaying = false; 

let localCountdownInterval = null; 
let previousCountdownInt = null;
// ---------------------  

// 2. HTML एलिमेंट्स (Toast Notification)
const liveToast = document.getElementById('live-toast');
const toastRoundNum = document.getElementById('toast-round-num');
const watchLiveBtn = document.getElementById('watch-live-btn');
const dismissLiveBtn = document.getElementById('dismiss-live-btn');
const closePublicPopupBtn = document.getElementById('close-public-popup'); // यह भी सुनिश्चित करें

let allParticipants = [];
let currentWinner = null;
let localState = {};
let celebrationIntervalId = null;
const totalRounds = 26;
const prizeConfig = [
    { range: [1, 20], prize: "Dinner Set", image: "Prizeimages/prize_dinner_set.jpg" },
    { range: [21, 23], prize: "LED TV", image: "Prizeimages/prize_led_tv.jpeg" },
    { range: [24, 25], prize: "Refrigerator", image: "Prizeimages/prize_fridge.png" },
    { range: [26, 26], prize: "Motorcycle (Mega Prize)", image: "Prizeimages/prize_bike.png" }
];
const countdownColors = ['#FFADAD', '#A0C4FF', '#9BF6FF', '#CAFFBF', '#FDFFB6', '#FFD6A5', '#BDB2FF', '#FFC6FF', '#FFFFFC', '#84D2F6'];
const COUNTDOWN_SECONDS = 10;

// --- Functions ---

function getPrizeDetails(round) {
    if (round > totalRounds) return null;
    return prizeConfig.find(config => round >= config.range[0] && round <= config.range[1]);
}

function primeSounds() {
    if (areSoundsPrimed) return;
    areSoundsPrimed = true;
    allSounds.forEach(sound => {
        if (sound.id === 'sound-background') return;
        if (sound) {
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
            }).catch(() => {});
        }
    });
}

function playSound(soundElement) {
    if (!isMuted && soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => console.warn("Audio play failed:", e));
    }
}

function stopSound(soundElement) {
    if (soundElement) {
        soundElement.pause();
        soundElement.currentTime = 0;
    }
}

function stopAllSounds() {
    allSounds.forEach(sound => stopSound(sound));
}

if (muteButton) {
    const muteStatusText = document.getElementById('mute-status-text');
    function updateMuteStatus() {
        if (isMuted) {
            muteStatusText.textContent = 'OFF';
            muteButton.title = 'Turn Sound ON';
            muteIcon.classList.remove('hidden');
            unmuteIcon.classList.add('hidden');
        } else {
            muteStatusText.textContent = 'ON';
            muteButton.title = 'Turn Sound OFF';
            muteIcon.classList.add('hidden');
            unmuteIcon.classList.remove('hidden');
        }
    }
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        updateMuteStatus();
        if (!isMuted && !areSoundsPrimed) primeSounds();
        if (isMuted) stopAllSounds();
    });
    updateMuteStatus();
}

function startContinuousCelebration() {
    if (celebrationIntervalId) return;
    playSound(celebrateSound);
    if (typeof confetti !== 'function') return;
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    celebrationIntervalId = setInterval(() => {
        const config = { particleCount: 100, startVelocity: 30, spread: 360, gravity: 0.8, ticks: 100, zIndex: 10001 };
        confetti({ ...config, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...config, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 200);
}

function stopCelebration() {
    stopSound(celebrateSound);
    if (celebrationIntervalId) {
        clearInterval(celebrationIntervalId);
        celebrationIntervalId = null;
        if (typeof confetti !== 'undefined') confetti.reset();
    }
}

const translations = {
    hi: { subtitle: "दिवाली स्पेशल लकी ड्रा", button: "विजेता चुनें!", winner_title: "विजेता", tab_winner: "परिणाम पेज", tab_participants: "हमारे बारे में", search_heading: "अपनी एंट्री जांचें", search_subheading: "अपनी एंट्री खोजने के लिए अपना मोबाइल नंबर या कूपन कोड दर्ज करें।", search_placeholder: "मोबाइल या कूपन कोड दर्ज करें...", search_button: "खोजें", searching: "खोज रहे हैं...", entry_found: "बधाई हो! आपकी एंट्री मिल गई है।", no_entry: "इस विवरण के साथ कोई एंट्री नहीं मिली।", empty_input: "कृपया खोजने के लिए कुछ दर्ज करें।", about_heading: "उत्कृष्टता के प्रति हमारी प्रतिबद्धता", about_p1: "हिंदुस्तान पेट्रोलियम कॉर्पोरेशन लिमिटेड (एचपीसीएल) भारत की अग्रणी तेल और गैस कंपनियों में से एक है...", about_p2: "यह लकी ड्रा एचपीसीएल को चुनने के लिए आपका धन्यवाद कहने का हमारा तरीका है...", winners_list_heading: "लकी ड्रा विजेता", th_round: "राउंड", th_prize: "पुरस्कार", th_name: "विजेता का नाम", th_coupon: "कूपन कोड", th_outlet: "आउटलेट", th_address: "आउटलेट का पता", th_mobile: "मोबाइल", countdown_heading: "लकी ड्रॉ कुछ ही पलों में शुरू होने वाला है, कृपया पेज पर बने रहें।", countdown_days: "दिन", countdown_hours: "घंटे", countdown_minutes: "मिनट", countdown_seconds: "सेकंड", draw_live_message: "ड्रॉ शुरू हो चुका है! अपना भाग्य आज़माने के लिए रिजल्ट पेज पर बने रहें।", prize_info_heading: "आज के पुरस्कार", draw_completed: "लकी ड्रॉ सफलतापूर्वक संपन्न हुआ। सभी विजेताओं को हार्दिक बधाई!", reel_title_waiting: "विजेता यहाँ देखें", reel_title_spinning: "कूपन कोड" },
    en: { subtitle: "Diwali Special Lucky Draw", button: "Reveal the Winner", winner_title: "Winner", tab_winner: "Result Page", tab_participants: "About Us", search_heading: "Check Your Coupon Code", search_subheading: "Enter your Mobile Number or Coupon Code to find your entry.", search_placeholder: "Enter Mobile or Coupon Code...", search_button: "Search", searching: "Searching...", entry_found: "Congratulations! Your entry has been found.", no_entry: "No entry found with these details.", empty_input: "Please enter something to search.", about_heading: "Our Commitment to Excellence", about_p1: "Hindustan Petroleum Corporation Limited (HPCL) is one of India's leading oil and gas companies...", about_p2: "This lucky draw is our way of saying thank you for choosing HPCL...", winners_list_heading: "Lucky Draw Winners", th_round: "Round", th_prize: "Prize", th_name: "Winner Name", th_coupon: "Coupon Code", th_outlet: "Outlet", th_address: "Outlet Address", th_mobile: "Mobile", countdown_heading: "The lucky draw is about to begin, please stay on this page.", countdown_days: "Days", countdown_hours: "Hours", countdown_minutes: "Minutes", countdown_seconds: "Seconds", draw_live_message: "The draw has started! Stay on the Result Page to try your luck.", prize_info_heading: "Today's Prizes", draw_completed: "The lucky draw has concluded successfully. Congratulations to all the winners!", reel_title_waiting: "WINNER REVEALS HERE", reel_title_spinning: "COUPON CODE" }
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
    if (searchInput) {
    searchInput.placeholder = t.search_placeholder;
}
if (searchButton) {
    searchButton.innerText = t.search_button;
}
    document.getElementById('about-heading').innerText = t.about_heading;
    document.getElementById('about-p1').innerText = t.about_p1;
    document.getElementById('about-p2').innerText = t.about_p2;
    document.getElementById('winners-list-heading').innerText = t.winners_list_heading;
    document.getElementById('th-round').innerText = t.th_round;
    document.getElementById('th-prize').innerText = t.th_prize;
    document.getElementById('th-name').innerText = t.th_name;
    document.getElementById('th-coupon').innerText = t.th_coupon;
    document.getElementById('th-outlet').innerText = t.th_outlet;
    document.getElementById('th-address').innerText = t.th_address;
    document.getElementById('th-mobile').innerText = t.th_mobile;
    document.getElementById('countdown-heading').innerText = t.countdown_heading;
    document.querySelector('#days + .label').innerText = t.countdown_days;
    document.querySelector('#hours + .label').innerText = t.countdown_hours;
    document.querySelector('#minutes + .label').innerText = t.countdown_minutes;
    document.querySelector('#seconds + .label').innerText = t.countdown_seconds;
    document.querySelector('#draw-live-message h2').innerText = t.draw_live_message;
    document.getElementById('prize-info-heading').innerText = t.prize_info_heading;
    langHi.classList.toggle('active', lang === 'hi');
    langEn.classList.toggle('active', lang === 'en');
    if (localState && (localState.status === 'ended' || (localState.round && localState.round > totalRounds))) {
        document.getElementById('countdown-heading').innerText = translations[lang].draw_completed;
    }
}

function startCountdown() {
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownTargetDate - now;
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownContainer.classList.add('hidden');
            drawLiveMessage.classList.remove('hidden');
           // if (userRole !== 'admin') {
             //   tabBtnParticipants.classList.add('disabled');
               // tabBtnWinner.click();
            //}
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

function fetchData() {
    // 1. सबसे पहले चेक करें कि क्या यूजर ADMIN है
    if (userRole !== 'admin') {
        console.log("Public User: No participant data fetched to save bandwidth.");
        // हम यहाँ return कर देंगे ताकि डेटाबेस से 'participants' का डेटा लोड ही न हो
        return; 
    }

    // --- नीचे का कोड सिर्फ एडमिन के लिए चलेगा ---
    const cacheKey = `hpcl_participants_${salesArea}`; 
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        console.log("Loading participants from Local Cache ✅");
        allParticipants = JSON.parse(cachedData);
        syncWinnersWithParticipants();
    } 
    else {
        console.log("Fetching participants from Server (Admin Only) ⚠️");
        // यह Read Operation सिर्फ एडमिन के लिए होगा
        participantsRef.get().then(querySnapshot => {
            if (!querySnapshot.empty) {
                allParticipants = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, isWinner: false, prize: null }));
                
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(allParticipants));
                } catch (e) {
                    console.warn("Data too big to cache.");
                }

                syncWinnersWithParticipants();
            }
        });
    }
}

function syncWinnersWithParticipants() {
    winnersRef.get().then(winnersSnapshot => {
        if (!winnersSnapshot.empty) {
            const winnerCoupons = new Set(winnersSnapshot.docs.map(doc => doc.data().CouponCode));
            allParticipants.forEach(p => {
                if (winnerCoupons.has(p.CouponCode)) {
                    p.isWinner = true;
                }
            });
        }
    });
}



async function fetchAndDisplayWinners() {
    const tableBody = document.getElementById('winners-table-body');
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-message">Loading winners...</td></tr>`;

    winnersRef.orderBy("Round", "desc").onSnapshot(querySnapshot => {
        tableBody.innerHTML = '';
        pastWinnersMap = {}; // Reset Map

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">No winners announced yet.</td></tr>`;
            if(localState && localState.round) renderGrid(localState.round, localState.status);
            return;
        }

        querySnapshot.forEach(doc => {
            const winner = doc.data();
            
            pastWinnersMap[winner.Round] = winner;

            const mobileDisplay = String(winner.CustomerPhone).substring(0, 2) + '******' + String(winner.CustomerPhone).substring(String(winner.CustomerPhone).length - 2);
            const outletAddress = winner.OutletAddress || 'N/A';
            let prizeDisplayHtml;
            switch (winner.Prize) {
                case "Motorcycle (Mega Prize)": prizeDisplayHtml = `Motorcycle <span class="prize-label mega-prize">MEGA PRIZE</span>`; break;
                case "Refrigerator": prizeDisplayHtml = `Refrigerator <span class="prize-label high-tier">Star Prize</span>`; break;
                case "LED TV": prizeDisplayHtml = `LED TV <span class="prize-label mid-tier">Bonus Prize</span>`; break;
                case "Dinner Set": prizeDisplayHtml = `Dinner Set <span class="prize-label regular-tier">Gift Prize</span>`; break;
                default: prizeDisplayHtml = winner.Prize;
            }
            const row = document.createElement('tr');
            const winnerName = winner.CustomerName || winner['Costomer Name'] || 'N/A';
            row.innerHTML = `<td>${winner.Round}</td><td>${prizeDisplayHtml}</td><td>${winnerName}</td><td>${winner.CouponCode}</td><td>${winner.PumpName}</td><td>${outletAddress}</td><td>${mobileDisplay}</td>`;
            tableBody.appendChild(row);
        });

        if(localState && localState.round) renderGrid(localState.round, localState.status);

    }, error => {
        console.error('Error fetching winners from Firestore:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">Failed to load winners list. Please try again later.</td></tr>`;
    });
}

function renderGrid(currentRound, status) {
    if (!roundsGrid) return;
    roundsGrid.innerHTML = ''; 
    
    for (let i = 1; i <= totalRounds; i++) {
        const box = document.createElement('div');
        box.className = 'round-box';
        
        // --- 1. PRIZE SETTINGS ---
        let prizeClass = "";
        let tagName = ""; 
        
        if (i >= 1 && i <= 20) {
            prizeClass = 'tier-dinner';
            tagName = "DINNER";
        } else if (i >= 21 && i <= 23) {
            prizeClass = 'tier-tv';
            tagName = "LED TV";
        } else if (i >= 24 && i <= 25) {
            prizeClass = 'tier-fridge';
            tagName = "FRIDGE";
        } else if (i === 26) {
            prizeClass = 'tier-bike';
            tagName = "BIKE";
        }
        
        box.classList.add(prizeClass);

        // --- 2. CREATE ELEMENTS ---
        
        const prizeTag = document.createElement('div');
        prizeTag.className = 'prize-tag';
        prizeTag.innerText = tagName;

        // B. Round Number
        const roundNum = document.createElement('div');
        roundNum.className = 'round-number';
        roundNum.innerText = i;
        
        // C. Status
        const roundStatus = document.createElement('div');
        roundStatus.className = 'round-status';

        // --- 3. STATUS LOGIC ---
        if (pastWinnersMap[i]) {
            // Completed
            box.classList.add('completed');
            roundStatus.innerText = "Winner"; 
            box.onclick = () => playReplay(i);
        } 
        else if (i === currentRound && status !== 'ended') {
            // Active
            if (status === 'finished') {
                box.classList.add('pending-save');
                roundStatus.innerText = "Saving...";
            } else {
                box.classList.add('live');
                roundStatus.innerText = "Live";
            }
        } 
        else {
            // Locked
            box.classList.add('locked');
            roundStatus.innerText = "Locked"; 
        }
        
        // --- 4. APPEND (Sequence Important) ---
        box.appendChild(prizeTag);   // 1. Tag (Top)
        box.appendChild(roundNum);   // 2. Number (Middle)
        box.appendChild(roundStatus);// 3. Status (Bottom)
        
        roundsGrid.appendChild(box);
    }
}
function playReplay(roundNum) {
    const winnerData = pastWinnersMap[roundNum];
    if (!winnerData) return;

    isReplaying = true; 
    
    showLiveView(false); 
    if(backToGridBtn) backToGridBtn.style.display = 'inline-block'; 
    
    const prizeDetail = getPrizeDetails(roundNum);
    if(subtitleText) subtitleText.innerText = `REPLAY: Round ${roundNum} - ${prizeDetail.prize}`;
    initializeReels(); 

    setTimeout(() => {
        beginReelSpin(winnerData.CouponCode);
    }, 500);
}

function showGridView() {
    isReplaying = false; 
    
    if(roundsGridContainer) roundsGridContainer.classList.remove('hidden');
    if(activeDrawView) activeDrawView.classList.add('hidden');
    if(backToGridBtn) backToGridBtn.style.display = 'none';
    
    if(localState) renderGrid(localState.round, localState.status);
    
    // Title Reset
    if(translations[currentLang]) subtitleText.innerText = translations[currentLang].subtitle;
}

function showLiveView(isRealLive) {
    if(roundsGridContainer) roundsGridContainer.classList.add('hidden');
    if(activeDrawView) activeDrawView.classList.remove('hidden');
    
    if (isRealLive) {
        if(liveIndicatorText) liveIndicatorText.style.display = 'block';
        if(backToGridBtn) backToGridBtn.style.display = 'none'; 
    } else {
        if(liveIndicatorText) liveIndicatorText.style.display = 'none';
    }
}


function syncUIWithState(state) {
    // 1. डेटा चेक
    if (userRole !== 'admin' && (!state || allParticipants.length === 0)) {
        // Public user waiting
    } else if (userRole === 'admin' && (!state || allParticipants.length === 0)) {
        return; 
    }

    const isLiveAction = state.status === 'countdown' || state.status === 'spinning' || (state.status === 'finished' && !pastWinnersMap[state.round]);
    
    // 3. नोटिफिकेशन (Public Only)
    if (isLiveAction && state.round !== lastNotifiedRound && userRole !== 'admin') {
        lastNotifiedRound = state.round;
        isUserWatchingLive = false; 
        showLiveToast(state.round); 
    }

    // 4. View Control
    if (isLiveAction) {
        if (userRole === 'admin' || isUserWatchingLive) {
            showLiveView(true);
            handleLiveAnimation(state);
        } else {
             if (!backToGridBtn || backToGridBtn.style.display === 'none') {
                showGridView();
            }
        }
    } else {
        if (state.status === 'waiting' && userRole === 'admin') {
            drawButton.disabled = false; 
            drawButton.innerText = "Reveal the Winner"; 
        }

        if (!backToGridBtn || backToGridBtn.style.display === 'none') {
            showGridView();
            initializeReels(); 
        }
    }
    
    // Toast Logic
    if(userRole !== 'admin') {
        if(isLiveAction && liveToast && !liveToast.classList.contains('dismissed') && !isUserWatchingLive) {
            liveToast.classList.remove('hidden');
        } else if (liveToast) {
            liveToast.classList.add('hidden');
        }
    }

    // 5. राउंड समाप्त (Ended)
    if (state.status === 'ended') {
        showThankYouPopup();
        if(liveToast) liveToast.classList.add('hidden');
        if (userRole === 'admin') drawButton.disabled = true;
        subtitleText.innerText = `All ${totalRounds} rounds are complete! Thank You!`;
    }
    
    localState = state;
    renderGrid(state.round, state.status);
}
function handleAdminClick() {
    if (localState.round > totalRounds) {
        alert("All rounds represent completed!");
        return;
    }
    
    playSound(revealSound);
    drawButton.disabled = true;
    
    const pastWinners = allParticipants.filter(p => p.isWinner);
    const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));
    const eligibleParticipants = allParticipants.filter(p => !p.isWinner && !winningOutletNames.has(p.PumpName));
    
    if (eligibleParticipants.length === 0) {
        alert("No eligible participants left!");
        drawButton.disabled = false;
        stopSound(revealSound);
        return;
    }
    
    const winner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
    
    const targetTimestamp = Date.now() + (COUNTDOWN_SECONDS * 1000) + 1000;

    gameStateRef.set({ 
        status: 'countdown', 
        round: localState.round, 
        winnerCoupon: winner.CouponCode,
        winnerDetails: winner,
        targetTime: targetTimestamp 
    });

    setTimeout(() => {
        gameStateRef.update({ status: 'spinning' });
    }, (COUNTDOWN_SECONDS * 1000) + 1500); // 11.5 सेकंड बाद स्पिनिंग
}

function handleLiveAnimation(state) {
    if (state.status === 'countdown') {
        if (localState.status !== 'countdown') { playSound(countdownSound); }
        
        countdownOverlay.classList.remove('hidden', 'slide-down');
        
        if (state.targetTime) {
            if (localCountdownInterval) clearInterval(localCountdownInterval);
             previousCountdownInt = null;

            localCountdownInterval = setInterval(() => {
                const now = Date.now();
                const distance = state.targetTime - now;
                
                let secondsLeft = Math.ceil(distance / 1000);
                
                if (secondsLeft < 0) secondsLeft = 0;
                
                runCountdown(secondsLeft);

                if (distance < 0) {
                    clearInterval(localCountdownInterval);
                }
            }, 100); 
        }
        
        // UI Fixes
        if(winnerBanner) winnerBanner.classList.remove('zoomed-in');
        initializeReels(); 

    } else {
        stopSound(countdownSound);
        countdownOverlay.classList.add('hidden');
        if (localCountdownInterval) clearInterval(localCountdownInterval);
    }

    if (state.status === 'spinning' && state.winnerCoupon) {
        if(winnerBanner) winnerBanner.classList.add('zoomed-in');
        beginReelSpin(state.winnerCoupon);
    }
    
    if (state.status === 'finished' && state.winnerCoupon) {
        if (userRole === 'admin') {
            const winnerData = state.winnerDetails || allParticipants.find(p => p.CouponCode === state.winnerCoupon);
            if(winnerData) {
                announceWinner(winnerData, state.round);
                reelCoupon.innerHTML = `<div class="reel-item final-winner">${state.winnerCoupon}</div>`;
                reelCoupon.style.transform = 'translateY(0)';
                if(winnerBanner) winnerBanner.classList.remove('zoomed-in');
            }
        }
    }
}

function showLiveToast(round) {
    if(!liveToast) return;
    if(toastRoundNum) toastRoundNum.innerText = round;
    liveToast.classList.remove('hidden');
    liveToast.classList.remove('dismissed');
    playSound(revealSound); 
}

function runCountdown(currentNumber) {
    if (currentNumber === previousCountdownInt) {
        return; 
    }
    previousCountdownInt = currentNumber; 
    const filmLeader = document.querySelector('.film-leader');
    const countdownNumberEl = document.getElementById('countdown-number');
    const rotatingWipe = document.getElementById('rotating-wipe');
    
    const displayNum = currentNumber > 10 ? 10 : currentNumber;

    if (displayNum > 0 && displayNum <= 10) {
        const colorIndex = (10 - displayNum) % countdownColors.length;
        filmLeader.style.setProperty('--countdown-fill-color', countdownColors[colorIndex]);
    }

    if (currentNumber > 0) {
        countdownNumberEl.innerText = currentNumber;
        countdownNumberEl.style.fontSize = '40vmin';
    } else {
        countdownNumberEl.innerText = 'GO!';
        countdownNumberEl.style.fontSize = '30vmin';
    }

    rotatingWipe.classList.remove('animate');
    void rotatingWipe.offsetWidth; 
    
    if (currentNumber > 0) {
        rotatingWipe.classList.add('animate');
    }
}

function generateRealisticCoupon() {
    let prefix = "HPCL-GEN"; // Default fallback
    
    const area = (salesArea || "").toLowerCase().trim();

    if (area.includes("aurangabad1")) {
        prefix = "HPCL-AUR1";
    } else if (area.includes("aurangabad2")) {
        prefix = "HPCL-AUR2";
    } else if (area.includes("shirdi")) {
        prefix = "HPCL-SHRD3";
    } else if (area.includes("jalna")) {
        prefix = "HPCL-JLN4";
    } else if (area.includes("ahmednagar") || area.includes("ahngr")) {
        prefix = "HPCL-AHNGR5";
    } else if (area.includes("akola")) {
        prefix = "HPCL-AKL6";
    }

    const randomNum = Math.floor(Math.random() * 1000000);
    const suffix = String(randomNum).padStart(6, '0');

    return `${prefix}${suffix}`;
}

function beginReelSpin(winnerCoupon) {
    if (reelCoupon.classList.contains('spinning')) return;
    
    if(!localState || localState.status !== 'finished') {
        playSound(spinSound);
    }
    
    document.getElementById('reel-title-coupon').innerText = translations[currentLang].reel_title_spinning;
    
    const isMobile = window.innerWidth <= 768;
    const itemHeight = isMobile ? 100 : 120;
    
    if(userRole === 'admin' && allParticipants.length > 0){
        const pastWinners = allParticipants.filter(p => p.isWinner);
        const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));
        const eligibleParticipantsForReel = allParticipants.filter(p => !p.isWinner && !winningOutletNames.has(p.PumpName));
        startContinuousReel(reelCoupon, eligibleParticipantsForReel, 'CouponCode', 10, itemHeight);
    } else {
        const dummyData = Array.from({length: 200}, () => ({ 
            CouponCode: generateRealisticCoupon() 
        }));
        startContinuousReel(reelCoupon, dummyData, 'CouponCode', 10, itemHeight);
    }
    
    reelCoupon.classList.add('spinning');
    
    setTimeout(() => {
        const stopTimeInSeconds = 5;
        stopReel(reelCoupon, winnerCoupon, stopTimeInSeconds, itemHeight);
        
        setTimeout(() => {
            stopSound(spinSound);
            
            if (userRole === 'admin') {
                if (!isReplaying) {
                    gameStateRef.update({ status: 'finished' });
                }

                let roundToShow = localState.round; 
                
                if (isReplaying) {
                    for (const [r, w] of Object.entries(pastWinnersMap)) {
                        if (w.CouponCode === winnerCoupon) {
                            roundToShow = parseInt(r);
                            break;
                        }
                    }
                }

                let winnerData = null;

                if (!isReplaying && localState.winnerDetails && localState.winnerDetails.CouponCode === winnerCoupon) {
                    winnerData = localState.winnerDetails;
                }
                else {
                    winnerData = allParticipants.find(p => p.CouponCode === winnerCoupon);
                }

                if (winnerData) {
                    console.log("Popup Opening for:", winnerData.CustomerName); // Debugging
                    announceWinner(winnerData, roundToShow);
                } else {
                    console.log("Fetching winner from DB...");
                     participantsRef.where('CouponCode', '==', winnerCoupon).get().then(snap => {
                        if(!snap.empty) {
                            announceWinner(snap.docs[0].data(), roundToShow);
                        } else {
                            alert("Error: Winner data not found!");
                        }
                    });
                }
            } 
            
            // --- PUBLIC LOGIC ---
            if (userRole !== 'admin') {
                showPublicWinnerPopup(winnerCoupon);
            }

        }, (stopTimeInSeconds * 1000) + 1000); 
    }, 5000); 
}

function stopReel(reelElement, finalValue, stopTimeInSeconds, itemHeight) {
    const items = reelElement.querySelectorAll('.reel-item');
    
    const targetIndex = items.length - 2; 
    const targetItem = items[targetIndex];
    
    if (targetItem) {
        targetItem.innerHTML = finalValue; 
        targetItem.classList.add('final-winner');
        targetItem.style.color = '#FFD700';
        
        const exactPosition = targetItem.offsetTop;

        void reelElement.offsetWidth;

        reelElement.style.transition = `transform ${stopTimeInSeconds}s cubic-bezier(0.15, 0.9, 0.25, 1)`;
        reelElement.style.transform = `translateY(-${exactPosition}px)`;
        
        setTimeout(() => {
            if(reelElement.parentElement && reelElement.parentElement.parentElement) {
                reelElement.parentElement.parentElement.style.border = '5px solid #d9232d';
                reelElement.parentElement.parentElement.style.boxShadow = '0 0 20px #d9232d';
            }
        }, stopTimeInSeconds * 1000);
    }
}

function startContinuousReel(reelElement, participantsArray, key, speed, itemHeight) {
    let entriesHtml = '';
    const totalReelItems = 100; 
    
    for (let i = 0; i < totalReelItems; i++) {
        const randomIndex = Math.floor(Math.random() * participantsArray.length);
        const participant = participantsArray[randomIndex];
        let displayValue = participant[key] || 'N/A';
        entriesHtml += `<div class="reel-item">${displayValue}</div>`;
    }
    
    reelElement.innerHTML = entriesHtml;
    
    reelElement.style.transition = 'none';
    reelElement.style.transform = `translateY(0px)`;
    
    setTimeout(() => {
        const finalScrollHeight = (totalReelItems * itemHeight) - itemHeight; 
        
        reelElement.style.transition = `transform ${speed}s linear`;
        reelElement.style.transform = `translateY(-${finalScrollHeight}px)`;
    }, 50);
}


function announceWinner(winner, round) {
    if (userRole !== 'admin') return;
    
    const prizeDetail = getPrizeDetails(round);
    
    if (!prizeDetail) {
        console.warn("Invalid round for prize:", round);
        return; 
    }

    currentWinner = winner;
    
    popupHeading.innerText = `Winner of Round ${round}: ${prizeDetail.prize}!`;
    prizeImage.src = prizeDetail.image;
    popupName.innerText = winner.CustomerName || winner['Costomer Name'] || 'N/A';
    popupCoupon.innerText = winner.CouponCode;
    popupOutlet.innerText = winner.PumpName;
    popupAddress.innerText = winner.OutletAddress || 'N/A';
    
    let mobileDisplay = String(winner.CustomerPhone);
    popupMobile.innerText = mobileDisplay.substring(0, 2) + '******' + mobileDisplay.substring(mobileDisplay.length - 2);
    
    winnerPopupOverlay.classList.remove('hidden');
    startContinuousCelebration();
    
    saveNextButton.disabled = false;

    if (isReplaying) {
        saveNextButton.innerText = "Close Popup";
        
        let newBtn = saveNextButton.cloneNode(true);
        saveNextButton.parentNode.replaceChild(newBtn, saveNextButton);
        saveNextButton = newBtn; // Reference update

        saveNextButton.onclick = () => {
            winnerPopupOverlay.classList.add('hidden');
            stopCelebration();
            showGridView(); 
        };
    } else {
        if (round >= totalRounds) {
            saveNextButton.innerText = "Finish Draw & Show Thank You";
        } else {
            saveNextButton.innerText = `Save & Ready for Round ${round + 1}`;
        }
        
        let newBtn = saveNextButton.cloneNode(true);
        saveNextButton.parentNode.replaceChild(newBtn, saveNextButton);
        saveNextButton = newBtn; // Reference update
        
        saveNextButton.addEventListener('click', handleSaveClick);
    }
}

async function handleSaveClick() {
    if (userRole !== 'admin' || !currentWinner) return;
    
    stopCelebration();
    saveNextButton.disabled = true;
    saveNextButton.innerText = 'Saving...';
    
    // 1. Local Array Update
    const originalIndex = allParticipants.findIndex(p => p.CouponCode === currentWinner.CouponCode);
    if (originalIndex !== -1) {
        allParticipants[originalIndex].isWinner = true;
    }
    
    // 2. Save Data
    const isSaved = await saveWinnerData(currentWinner, localState.round);
    
    if (isSaved) {
        winnerPopupOverlay.classList.add('hidden'); 
        
        if (localState.round >= totalRounds) {
            gameStateRef.set({ status: 'ended', round: localState.round, winnerCoupon: null });
        } else {
            gameStateRef.set({ status: 'waiting', round: localState.round + 1, winnerCoupon: null, countdownValue: null });
        }
    } else {
        alert("Error saving data! Please try again.");
        saveNextButton.disabled = false;
        saveNextButton.innerText = `Save & Ready for Round ${localState.round + 1}`;
    }
}

async function handleResetClick() {
    if (!confirm("Are you sure you want to reset the draw to the last safe point?")) return;
    
    stopCelebration();
    stopAllSounds();
    
    drawButton.disabled = false;
    isReplaying = false; 
    
    const winnersSnapshot = await winnersRef.orderBy("Round", "desc").limit(1).get();
    let lastCompletedRound = 0;
    if (!winnersSnapshot.empty) {
        lastCompletedRound = winnersSnapshot.docs[0].data().Round;
    }
    
    const nextRound = lastCompletedRound + 1;
    
    gameStateRef.set({ 
        status: 'waiting', 
        round: nextRound, 
        winnerCoupon: null, 
        countdownValue: null,
        winnerDetails: null 
    });
    
    alert("Draw reset successfully to Round " + nextRound);
}

async function initializeApp() {
    const splashScreen = document.getElementById('splash-screen');
    const enterButton = document.getElementById('enter-button');
    
    if (enterButton && splashScreen) {
        setTimeout(() => {
            enterButton.classList.add('visible');
        }, 3000);

        enterButton.addEventListener('click', () => {
            primeSounds();
            playSound(backgroundMusic);
            if (splashScreen) {
                splashScreen.classList.add('hidden');
            }
        }, { once: true });
    }
    
    startPaperRain();
    startCountdown();
    fetchData(); 
    fetchAndDisplayWinners();
    
    gameStateRef.onSnapshot((doc) => {
        const state = doc.data();
        if (state) {
            syncUIWithState(state);
        }
    });

    const doc = await gameStateRef.get();
    if (doc.exists) {
        syncUIWithState(doc.data());
    } else if (userRole === 'admin') {
        handleResetClick();
    }
}
  
function showThankYouPopup() { 
    if (thankYouPopupOverlay) { 
        thankYouPopupOverlay.classList.remove('hidden'); 
    } 
}

function hideThankYouPopup() { 
    if (thankYouPopupOverlay) { 
        thankYouPopupOverlay.classList.add('hidden'); 
    } 
}

function initializeReels() {
    const defaultText = '<div class="reel-item">READY</div>';
    
    if(reelCoupon) {
        reelCoupon.innerHTML = defaultText;
        
        reelCoupon.style.transition = 'none'; // एनीमेशन हटाएं
        reelCoupon.style.transform = 'translateY(0px)';
        reelCoupon.classList.remove('spinning');
        
        const items = reelCoupon.querySelectorAll('.reel-item');
        items.forEach(item => item.classList.remove('final-winner'));
    }
    
    // Title reset
    const titleEl = document.getElementById('reel-title-coupon');
    if(titleEl && translations[currentLang]) {
        titleEl.innerText = translations[currentLang].reel_title_waiting;
    }
}

async function saveWinnerData(winner, round) {
    try {
        const prizeDetail = getPrizeDetails(round);
        if (!prizeDetail) return false;

        const winnerDataWithPrize = { ...winner, Round: round, Prize: prizeDetail.prize, Timestamp: new Date().toISOString(), salesArea: salesArea };
        
        const specificWinnerRef = winnersRef.doc(winner.CouponCode);
        await specificWinnerRef.set(winnerDataWithPrize);
        
        console.log('SUCCESS: Winner saved to Firestore for area:', salesArea);
        
        try {
            if (APPS_SCRIPT_URL) {
                fetch(APPS_SCRIPT_URL, { 
                    method: 'POST', 
                    mode: 'no-cors', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(winnerDataWithPrize) 
                }).catch(e => console.error("Sheet Error (Background):", e));
                
                console.log('Sent to Google Sheet (Background).');
            }
        } catch (sheetError) {
            console.error('GOOGLE SHEET ERROR:', sheetError);
        }
        return true;
    } catch (error) {
        console.error('FIRESTORE ERROR while saving winner:', error);
        return false;
    }
}

// --- Event Listeners ---
if (userRole === 'admin') {
    drawButton.style.display = 'inline-block';
    drawButton.addEventListener('click', handleAdminClick);
    saveNextButton.addEventListener('click', handleSaveClick);
    resetButton.style.display = 'inline-block';
    resetButton.addEventListener('click', handleResetClick);
} else {
    drawButton.style.display = 'none';
}

if (closeThankYouPopupButton) { 
    closeThankYouPopupButton.addEventListener('click', hideThankYouPopup); 
}
langHi.addEventListener('click', (e) => { e.preventDefault(); setLanguage('hi'); });
langEn.addEventListener('click', (e) => { e.preventDefault(); setLanguage('en'); });


const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        const targetTab = button.getAttribute('data-tab');
        document.querySelector(`.tab-panel[data-tab="${targetTab}"]`).classList.add('active');
        if (targetTab === 'winner' && localState && localState.status === 'finished' && userRole !== 'admin') {
             winnerBanner.classList.add('zoomed-in');
        }
    });
});
if (backToGridBtn) {
    backToGridBtn.addEventListener('click', () => {
        stopAllSounds();
        showGridView();
    });
}
function startPaperRain() {
  if (typeof confetti !== 'function') { console.error("Confetti library is not loaded."); return; }
  const brandColors = ['#d9232d', '#003366', '#FFD700', '#ffffff'];
  setInterval(() => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 180,
      origin: { x: Math.random(), y: 0 },
      colors: brandColors,
      gravity: 1.0,
      scalar: 0.8,
      drift: Math.random() * 2 - 1
    });
  }, 1000);
}

initializeApp();

const logoutButton = document.getElementById('logout-button');

if (userRole === 'admin') {
    logoutButton.style.display = 'inline-block';
}

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            console.log('User signed out successfully.');
            window.location.href = 'admin_login.html';
        })
        .catch((error) => {
            console.error('Sign out error:', error);
        });
});

if(watchLiveBtn) {
    watchLiveBtn.addEventListener('click', () => {
        isUserWatchingLive = true; 
        liveToast.classList.add('hidden'); 
        if(localState) syncUIWithState(localState);
    });
}

if(dismissLiveBtn) {
    dismissLiveBtn.addEventListener('click', () => {
        liveToast.classList.add('hidden');
        liveToast.classList.add('dismissed'); 
    });
}

if (closePublicPopupBtn) {
    closePublicPopupBtn.addEventListener('click', () => {
        if(publicWinnerCard) publicWinnerCard.classList.add('hidden');
        stopCelebration();
        
        isUserWatchingLive = false; 
        showGridView();
    });
}

if (backToGridBtn) {
    backToGridBtn.addEventListener('click', () => {
        stopAllSounds();
        isUserWatchingLive = false;
        showGridView();
    });
}

function showPublicWinnerPopup(couponCode) {
    let winnerData = Object.values(pastWinnersMap).find(w => w.CouponCode === couponCode);

    if (!winnerData && localState && localState.winnerDetails && localState.winnerDetails.CouponCode === couponCode) {
        winnerData = localState.winnerDetails;
        winnerData.Round = localState.round;
    }

    if (winnerData) {
        playSound(winnerSound); 
        const currentRound = winnerData.Round || localState.round;
        const prizeDetail = getPrizeDetails(currentRound);
        
        const mobileNum = String(winnerData.CustomerPhone || winnerData['CustomerPhone'] || '0000000000');
        const mobileDisplay = mobileNum.substring(0, 2) + '******' + mobileNum.substring(mobileNum.length - 2);
        const outletAddress = winnerData.OutletAddress || 'N/A';

        publicHeading.innerText = `Winner of Round ${currentRound}: ${prizeDetail ? prizeDetail.prize : 'Prize'}!`;
        if (prizeDetail) publicPrizeImage.src = prizeDetail.image;
        
        publicName.innerText = winnerData.CustomerName || winnerData['Costomer Name'] || 'N/A';
        publicCoupon.innerText = winnerData.CouponCode;
        publicOutlet.innerText = winnerData.PumpName;
        publicAddress.innerText = outletAddress;
        publicMobile.innerText = mobileDisplay;

        if(publicWinnerCard) {
            publicWinnerCard.classList.remove('hidden');
            publicWinnerCard.style.animation = 'none';
            publicWinnerCard.offsetHeight; /* trigger reflow */
            publicWinnerCard.style.animation = 'zoomIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
        
        startContinuousCelebration();
    } else {
        console.warn("Winner data not found anywhere for coupon:", couponCode);
    }
}


if (closePublicPopupBtn) {
    closePublicPopupBtn.addEventListener('click', () => {
        publicWinnerCard.classList.add('hidden');
        stopCelebration();
    });
}