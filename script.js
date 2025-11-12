// --- START: इस पूरे कोड को अपनी script.js फाइल में पेस्ट करें ---

// 1. Firebase कॉन्फ़िगरेशन (यह आपकी अपनी कॉन्फ़िगरेशन होनी चाहिए)
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
const auth = firebase.auth();
const db = firebase.firestore(); // Firestore को शुरू करें
const database = firebase.database(); // इसे ऑनलाइन यूजर्स के लिए रखें

// 2. सुरक्षा गेटकीपर: यह बिना लॉगिन के एडमिन को पेज पर आने से रोकेगा
auth.onAuthStateChanged(user => {
    const urlParams = new URLSearchParams(window.location.search);
    const userRole = urlParams.get('role');
    if (userRole === 'admin' && !user) {
        console.log("Admin access denied. Redirecting to login page.");
        window.location.href = 'admin_login.html';
    }
});

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS4ReuKp0Evds7Ttj-tHQ0AhaEGuXZih1UnnKgtvXz9oN7bvF1uNqCezNpyKmnYZsQsA/exec';

// URL और Firebase रेफरेंस
const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('role');
const salesArea = urlParams.get('area');

if (!salesArea) {
    document.body.innerHTML = `<h1 style="color: white; text-align:center; margin-top: 50px;">Sales Area Not Specified. Please add '?area=your_area_name' to the URL.</h1>`;
    throw new Error("Sales Area not specified in URL.");
}

const salesAreaRef = db.collection(salesArea);
const gameStateRef = salesAreaRef.doc('drawState');
const winnersRef = salesAreaRef.collection('winners');
const participantsRef = salesAreaRef.collection('participants');
// ऑनलाइन यूजर्स के लिए पुराना रेफरेंस ही रहेगा
const onlineUsersRef = database.ref(salesArea).child('onlineUsers');

// 3. डीबगिंग कोड: यह कंसोल में बताएगा कि कोड डेटा कहाँ ढूंढ रहा है
console.log("Searching for data in area:", salesArea);
console.log("Full database path being checked:", participantsRef.toString());

// --- साउंड वेरिएबल्स ---
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

// --- DOM एलिमेंट्स और अन्य वेरिएबल्स ---
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
const saveNextButton = document.getElementById('save-next-button');
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
const countdownTargetDate = new Date("2025-11-14T12:00:00");
let allParticipants = [];
let currentWinner = null;
let localState = {};
let celebrationIntervalId = null;
const REEL_LENGTH = 1000;
const totalRounds = 26;
const prizeConfig = [
    { range: [1, 20], prize: "Dinner Set", image: "Prizeimages/prize_dinner_set.jpg" },
    { range: [21, 23], prize: "LED TV", image: "Prizeimages/prize_led_tv.jpeg" },
    { range: [24, 25], prize: "Refrigerator", image: "Prizeimages/prize_fridge.png" },
    { range: [26, 26], prize: "Motorcycle (Mega Prize)", image: "Prizeimages/prize_bike.png" }
];
const countdownColors = ['#FFADAD', '#A0C4FF', '#9BF6FF', '#CAFFBF', '#FDFFB6', '#FFD6A5', '#BDB2FF', '#FFC6FF', '#FFFFFC', '#84D2F6'];
const COUNTDOWN_SECONDS = 10;

// --- यहाँ से सारे फंक्शन्स शुरू होते हैं ---

function getPrizeDetails(round) {
    if (round > totalRounds) return null;
    return prizeConfig.find(config => round >= config.range[0] && round <= config.range[1]);
}

function primeSounds() {
    if (areSoundsPrimed) return;
    areSoundsPrimed = true;
    console.log("Audio context unlocked by user.");
    allSounds.forEach(sound => {
        // अगर यह बैकग्राउंड म्यूजिक है, तो इसे छोड़कर आगे बढ़ें
        if (sound.id === 'sound-background') {
            return; 
        }

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
        soundElement.play().catch(e => console.warn("Audio play was interrupted or failed:", e));
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
        if (!isMuted && !areSoundsPrimed) {
            primeSounds();
        }
        if (isMuted) {
            stopAllSounds();
        }
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
    searchInput.placeholder = t.search_placeholder;
    searchButton.innerText = t.search_button;
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
            if (userRole !== 'admin') {
                tabBtnParticipants.classList.add('disabled');
                tabBtnWinner.click();
            }
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

// 4. सुधारा हुआ fetchData फंक्शन (रियल-टाइम और भरोसेमंद)
function fetchData() {
    participantsRef.get().then(querySnapshot => {
        if (!querySnapshot.empty) {
            allParticipants = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, isWinner: false, prize: null }));
            console.log("SUCCESS: Participants data loaded successfully for area:", salesArea);

            winnersRef.get().then(winnersSnapshot => {
                if (!winnersSnapshot.empty) {
                    const winnerCoupons = new Set(winnersSnapshot.docs.map(doc => doc.data().CouponCode));
                    allParticipants.forEach(p => {
                        if (winnerCoupons.has(p.CouponCode)) {
                            p.isWinner = true;
                        }
                    });
                }
                console.log("Past winners status synced with participants list.");
            });
        } else {
            console.error("ERROR: No 'participants' found in collection:", salesArea);
            subtitleText.innerText = "Error: Participants data not found.";
        }
    }).catch(error => {
        console.error("Firestore read error:", error);
        subtitleText.innerText = "Error: Could not load data.";
    });
}

function searchParticipant() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        searchResultContainer.innerHTML = `<div class="result-message error">${translations[currentLang].empty_input}</div>`;
        return;
    }
    searchResultContainer.innerHTML = `<div class="result-message">${translations[currentLang].searching}</div>`;
    
    setTimeout(() => {
        const result = allParticipants.find(p => (p['CustomerPhone'] && String(p['CustomerPhone']) === searchTerm) || (p['CouponCode'] && p['CouponCode'] === searchTerm));
        
        if (result) {
            const customerName = result.CustomerName || result['Costomer Name'] || 'N/A';
            const customerPhone = result['CustomerPhone'] || 'N/A';
            const vehicleNumber = result['VehicleNumber'] || 'N/A';
            const couponCode = result['CouponCode'] || 'N/A';
            const pumpName = result['PumpName'] || 'N/A';
            
            // <<<--- यहाँ बदलाव किया गया है ---<<<
            // 1. रिजल्ट कार्ड के अंदर क्लोज बटन ('&times;' का मतलब 'X' होता है) जोड़ा गया है
            searchResultContainer.innerHTML = `
                <div class="result-message success">${translations[currentLang].entry_found}</div>
                <div class="result-card">
                    <button id="close-search-result" class="close-btn">&times;</button>
                    <p><strong>Outlet Name:</strong> ${pumpName}</p>
                    <p><strong>Customer Name:</strong> ${customerName}</p>
                    <p><strong>Mobile Number:</strong> ${String(customerPhone).substring(0, 2) + '******' + String(customerPhone).substring(String(customerPhone).length - 2)}</p>
                    <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
                    <p><strong>Coupon Code:</strong> ${couponCode}</p>
                </div>`;

            // 2. अब उस क्लोज बटन को ढूंढें और उसे काम करने का तरीका बताएं
            const closeButton = document.getElementById('close-search-result');
            if(closeButton) {
                closeButton.addEventListener('click', () => {
                    // जब बटन पर क्लिक हो, तो पूरे रिजल्ट को खाली कर दें
                    searchResultContainer.innerHTML = '';
                });
            }
            // <<<--- बदलाव यहाँ खत्म ---<<<

        } else {
            searchResultContainer.innerHTML = `<div class="result-message error">${translations[currentLang].no_entry}</div>`;
        }
    }, 500);
}

async function fetchAndDisplayWinners() {
    const tableBody = document.getElementById('winners-table-body');
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-message">Loading winners...</td></tr>`;

    winnersRef.orderBy("Round", "desc").onSnapshot(querySnapshot => {
        tableBody.innerHTML = '';
        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">No winners announced yet.</td></tr>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const winner = doc.data();
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
    }, error => {
        console.error('Error fetching winners from Firestore:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">Failed to load winners list. Please try again later.</td></tr>`;
    });
}

function syncUIWithState(state) {
    if (!state || allParticipants.length === 0) return;

    if (state.status === 'ended' || (state.round && state.round > totalRounds)) {
        const countdownHeading = document.getElementById('countdown-heading');
        const countdownTimer = document.querySelector('.countdown-timer');
        countdownHeading.innerText = translations[currentLang].draw_completed;
        countdownContainer.classList.remove('hidden');
        drawLiveMessage.classList.add('hidden');
        if (countdownTimer) countdownTimer.classList.add('hidden');
    }

    if (state.status !== 'finished') { stopCelebration(); }
    winnerPopupOverlay.classList.add('hidden');
    publicWinnerCard.classList.add('hidden');

    if (state.status === 'waiting') {
        if (localState.status && localState.status !== 'waiting') { stopAllSounds(); }
        const prize = getPrizeDetails(state.round);
        if (prize) {
            subtitleText.innerText = `Ready for Round ${state.round}/${totalRounds}: ${prize.prize}`;
            if (userRole === 'admin') drawButton.disabled = false;
        } else {
            subtitleText.innerText = `All ${totalRounds} rounds are complete! Thank You!`;
            if (userRole === 'admin') drawButton.disabled = true;
        }
        initializeReels();
        winnerBanner.classList.remove('zoomed-in');
    } else {
        if (userRole === 'admin') drawButton.disabled = true;
    }

    if (state.status === 'countdown') {
        if (localState.status !== 'countdown') { playSound(countdownSound); }
        countdownOverlay.classList.remove('hidden', 'slide-down');
        runCountdown(state.countdownValue);
        winnerBanner.classList.remove('zoomed-in');
    } else {
        stopSound(countdownSound);
        countdownOverlay.classList.add('hidden');
    }

    if (state.status === 'spinning' && state.winnerCoupon) {
        winnerBanner.classList.add('zoomed-in');
        beginReelSpin(state.winnerCoupon);
    }

    if (state.status === 'finished' && state.winnerCoupon) {
        stopSound(spinSound);
        const winner = allParticipants.find(p => p.CouponCode === state.winnerCoupon);
        if (winner) {
            if (localState.status !== 'finished') { playSound(winnerSound); }
            const prizeDetail = getPrizeDetails(state.round);
            const mobileDisplay = String(winner.CustomerPhone).substring(0, 2) + '******' + String(winner.CustomerPhone).substring(String(winner.CustomerPhone).length - 2);
            const outletAddress = winner.OutletAddress || 'N/A';
            reelCoupon.innerHTML = `<div class="reel-item final-winner">${winner.CouponCode}</div>`;
            reelCoupon.style.transform = 'translateY(0)';
            reelCoupon.parentElement.parentElement.style.border = '3px solid #d9232d';
            if (userRole === 'admin') {
                announceWinner(winner, state.round);
                winnerBanner.classList.remove('zoomed-in');
            } else {
                publicHeading.innerText = `Winner of Round ${state.round}: ${prizeDetail.prize}!`;
                publicPrizeImage.src = prizeDetail.image;
                publicName.innerText = winner.CustomerName || winner['Costomer Name'] || 'N/A';
                publicCoupon.innerText = winner.CouponCode;
                publicOutlet.innerText = winner.PumpName;
                publicAddress.innerText = outletAddress;
                publicMobile.innerText = mobileDisplay;
                publicWinnerCard.classList.remove('hidden');
                startContinuousCelebration();
            }
        }
    }
    
    if (state.status === 'ended') {
        showThankYouPopup();
        if (userRole === 'admin') drawButton.disabled = true;
        subtitleText.innerText = `All ${totalRounds} rounds are complete! Thank You!`;
    }
    
    localState = state;
}

function handleAdminClick() {
    playSound(revealSound);
    drawButton.disabled = true;
    const pastWinners = allParticipants.filter(p => p.isWinner);
    const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));
    const eligibleParticipants = allParticipants.filter(p => !p.isWinner && !winningOutletNames.has(p.PumpName));
    if (eligibleParticipants.length === 0) {
        alert("ड्रॉ के लिए कोई योग्य प्रतिभागी या आउटलेट नहीं बचा है!");
        drawButton.disabled = false;
        stopSound(revealSound);
        return;
    }
    const winner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
    gameStateRef.set({ status: 'countdown', round: localState.round, winnerCoupon: winner.CouponCode, countdownValue: COUNTDOWN_SECONDS }).then(() => {
        let count = COUNTDOWN_SECONDS;
        const countdownInterval = setInterval(() => {
            count--;
            if (count >= 0) {
                gameStateRef.update({ countdownValue: count });
            } else {
                gameStateRef.update({ status: 'spinning' });
                clearInterval(countdownInterval);
            }
        }, 1000);
    });
}

function runCountdown(currentNumber) {
    const filmLeader = document.querySelector('.film-leader');
    if (currentNumber > 0) {
        const colorIndex = (COUNTDOWN_SECONDS - currentNumber) % countdownColors.length;
        const selectedColor = countdownColors[colorIndex];
        filmLeader.style.setProperty('--countdown-fill-color', selectedColor);
    } else {
        const lastColorIndex = (COUNTDOWN_SECONDS - 1) % countdownColors.length;
        filmLeader.style.setProperty('--countdown-fill-color', countdownColors[lastColorIndex]);
    }
    const countdownNumberEl = document.getElementById('countdown-number');
    const rotatingWipe = document.getElementById('rotating-wipe');
    rotatingWipe.classList.remove('animate');
    countdownNumberEl.innerText = currentNumber > 0 ? currentNumber : 'GO!';
    countdownNumberEl.style.fontSize = currentNumber > 0 ? '40vmin' : '30vmin';
    setTimeout(() => { rotatingWipe.classList.add('animate'); }, 20);
}

function beginReelSpin(winnerCoupon) {
    if (reelCoupon.classList.contains('spinning')) return;
    playSound(spinSound);
    document.getElementById('reel-title-coupon').innerText = translations[currentLang].reel_title_spinning;
    const pastWinners = allParticipants.filter(p => p.isWinner);
    const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));
    const eligibleParticipantsForReel = allParticipants.filter(p => !p.isWinner && !winningOutletNames.has(p.PumpName));
    const itemHeight = reelCoupon.querySelector('.reel-item')?.offsetHeight || 100;
    let reel = startContinuousReel(reelCoupon, eligibleParticipantsForReel, 'CouponCode', 10, itemHeight);
    reelCoupon.classList.add('spinning');
    setTimeout(() => {
        const stopTimeInSeconds = 5;
        stopReel(reel, winnerCoupon, stopTimeInSeconds, itemHeight);
        setTimeout(() => {
            if (userRole === 'admin') {
                gameStateRef.update({ status: 'finished' });
            }
        }, (stopTimeInSeconds * 1000) + 2000);
    }, 5000);
}

function stopReel(reelObject, finalValue, stopTimeInSeconds, itemHeight) {
    const { reelElement, FINAL_ITEMS_COUNT } = reelObject;
    const TARGET_POS_IN_FINAL_CHUNK = 49;
    const TOTAL_ITEMS_IN_REEL = reelElement.querySelectorAll('.reel-item').length;
    const FINAL_POS_INDEX = TOTAL_ITEMS_IN_REEL - FINAL_ITEMS_COUNT + TARGET_POS_IN_FINAL_CHUNK;
    let items = reelElement.querySelectorAll('.reel-item');
    if (items.length > FINAL_POS_INDEX) {
        items[FINAL_POS_INDEX].textContent = finalValue;
        items[FINAL_POS_INDEX].classList.add('final-winner');
    }
    const finalScrollPosition = FINAL_POS_INDEX * itemHeight;
    setTimeout(() => {
        reelElement.style.transition = `transform ${stopTimeInSeconds}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        reelElement.style.transform = `translateY(-${finalScrollPosition}px)`;
        setTimeout(() => {
            reelElement.parentElement.parentElement.style.border = '3px solid #d9232d';
        }, stopTimeInSeconds * 1000);
    }, 100);
}

function startContinuousReel(reelElement, participantsArray, key, speed, itemHeight) {
    const FINAL_ITEMS_COUNT = 100;
    let entriesHtml = '';
    for (let loop = 0; loop < 5; loop++) {
        for (let i = 0; i < FINAL_ITEMS_COUNT; i++) {
            if (participantsArray.length === 0) continue;
            const randomIndex = Math.floor(Math.random() * participantsArray.length);
            const participant = participantsArray[randomIndex];
            let displayValue = participant[key] || 'N/A';
            entriesHtml += `<div class="reel-item">${displayValue}</div>`;
        }
    }
    reelElement.innerHTML = entriesHtml;
    const rollDistance = reelElement.scrollHeight;
    reelElement.style.transition = 'none';
    reelElement.style.transform = `translateY(0px)`;
    setTimeout(() => {
        reelElement.style.transition = `transform ${speed}s linear`;
        reelElement.style.transform = `translateY(-${rollDistance - (itemHeight * FINAL_ITEMS_COUNT)}px)`;
    }, 100);
    return { reelElement, FINAL_ITEMS_COUNT };
}

function announceWinner(winner, round) {
    if (userRole !== 'admin') return;
    currentWinner = winner;
    const prizeDetail = getPrizeDetails(round);
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
    saveNextButton.innerText = `Save & Ready for Round ${round + 1}`;
}

async function handleSaveClick() {
    if (userRole !== 'admin' || !currentWinner) return;
    stopCelebration();
    saveNextButton.disabled = true;
    saveNextButton.innerText = 'Saving...';
    const originalIndex = allParticipants.findIndex(p => p.CouponCode === currentWinner.CouponCode);
    if (originalIndex !== -1) {
        allParticipants[originalIndex].isWinner = true;
    }
    const isSaved = await saveWinnerData(currentWinner, localState.round);
    if (isSaved) {
        if (localState.round >= totalRounds) {
            console.log("All rounds complete. Showing thank you popup.");
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
    console.log("Resetting draw state...");
    stopCelebration();
    const winnersSnapshot = await winnersRef.get();
    let lastCompletedRound = 0;
    if (winnersSnapshot.exists()) {
        const winnersData = winnersSnapshot.val();
        const rounds = Object.values(winnersData).map(winner => winner.Round);
        if (rounds.length > 0) {
            lastCompletedRound = Math.max(...rounds);
        }
    }
    const nextRound = lastCompletedRound + 1;
    console.log(`Resetting to start of round ${nextRound}.`);
    gameStateRef.set({ status: 'waiting', round: nextRound, winnerCoupon: null, countdownValue: null });
}

async function initializeApp() {
    const splashScreen = document.getElementById('splash-screen');
    const enterButton = document.getElementById('enter-button');
    
    if (enterButton && splashScreen) {
        // <<<--- यहाँ सारा बदलाव किया गया है ---<<<
        // 3 सेकंड बाद, बटन पर 'visible' क्लास लगा दें
        setTimeout(() => {
            enterButton.classList.add('visible');
        }, 3000);

        enterButton.addEventListener('click', () => {
            console.log("Enter button clicked. Priming sounds...");
            primeSounds();
             playSound(backgroundMusic);
            if (splashScreen) {
                splashScreen.classList.add('hidden');
            }
        }, { once: true });
    }
    
    // बाकी का फंक्शन वैसा का वैसा ही रहेगा
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
    
    const connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snapshot) => { 
        if (snapshot.val() === true) { 
            const userConnection = onlineUsersRef.push(); 
            userConnection.onDisconnect().remove(); 
            userConnection.set(true); 
        } 
    });
    
    if (userRole === 'admin') {
        const adminDashboard = document.getElementById('admin-dashboard');
        const totalViewerCountEl = document.getElementById('viewer-count');
        const viewerBreakdownEl = document.getElementById('viewer-breakdown');
        if (adminDashboard) { adminDashboard.style.display = 'block'; }
        const ALL_SALES_AREAS = ['akola', 'aurangabad1', 'aurangabad2', 'shirdi', 'jalna', 'ahemadnagar'];
        const liveCounts = {};
        function updateViewerDisplay() {
            let totalViewers = 0;
            let breakdownHtml = '<ul>';
            ALL_SALES_AREAS.forEach(area => { 
                const count = liveCounts[area] || 0; 
                totalViewers += count; 
                breakdownHtml += `<li><span class="area-name">${area}</span> <span class="area-count">${count}</span></li>`; 
            });
            breakdownHtml += '</ul>';
            if (totalViewerCountEl) { totalViewerCountEl.innerText = totalViewers; }
            if (viewerBreakdownEl) { viewerBreakdownEl.innerHTML = breakdownHtml; }
        }
        ALL_SALES_AREAS.forEach(areaName => { 
            const areaOnlineUsersRef = database.ref(areaName).child('onlineUsers'); 
            areaOnlineUsersRef.on('value', (snapshot) => { 
                liveCounts[areaName] = snapshot.numChildren(); 
                updateViewerDisplay(); 
            }); 
        });
    }
}
    // <<<--- END: यहाँ तक ---<<<
    
    if (userRole === 'admin') {
        const adminDashboard = document.getElementById('admin-dashboard');
        const totalViewerCountEl = document.getElementById('viewer-count');
        const viewerBreakdownEl = document.getElementById('viewer-breakdown');
        if (adminDashboard) { adminDashboard.style.display = 'block'; }
        const ALL_SALES_AREAS = ['akola', 'aurangabad1', 'aurangabad2', 'shirdi', 'jalna', 'ahemadnagar'];
        const liveCounts = {};
        function updateViewerDisplay() {
            let totalViewers = 0;
            let breakdownHtml = '<ul>';
            ALL_SALES_AREAS.forEach(area => { const count = liveCounts[area] || 0; totalViewers += count; breakdownHtml += `<li><span class="area-name">${area}</span> <span class="area-count">${count}</span></li>`; });
            breakdownHtml += '</ul>';
            if (totalViewerCountEl) { totalViewerCountEl.innerText = totalViewers; }
            if (viewerBreakdownEl) { viewerBreakdownEl.innerHTML = breakdownHtml; }
        }
        ALL_SALES_AREAS.forEach(areaName => { const areaOnlineUsersRef = database.ref(areaName).child('onlineUsers'); areaOnlineUsersRef.on('value', (snapshot) => { liveCounts[areaName] = snapshot.numChildren(); updateViewerDisplay(); }); });
    }

function showThankYouPopup() { if (thankYouPopupOverlay) { thankYouPopupOverlay.classList.remove('hidden'); } }
function hideThankYouPopup() { if (thankYouPopupOverlay) { thankYouPopupOverlay.classList.add('hidden'); } }

function initializeReels() {
    const defaultText = '<div class="reel-item">READY TO DRAW</div>';
    reelCoupon.innerHTML = defaultText;
    reelCoupon.style.transform = 'translateY(0px)';
    document.querySelectorAll('.reel-box').forEach(box => { box.style.border = '3px solid #FFD700'; });
    reelCoupon.classList.remove('spinning');
    document.getElementById('reel-title-coupon').innerText = translations[currentLang].reel_title_waiting;
}

async function saveWinnerData(winner, round) {
    try {
        const prizeDetail = getPrizeDetails(round);
        const winnerDataWithPrize = { ...winner, Round: round, Prize: prizeDetail.prize, Timestamp: new Date().toISOString(), salesArea: salesArea };
        
        // Firestore में डॉक्यूमेंट सेट करें
        const specificWinnerRef = winnersRef.doc(winner.CouponCode);
        await specificWinnerRef.set(winnerDataWithPrize);
        
        console.log('SUCCESS: Winner saved to Firestore for area:', salesArea);
        
        try {
            if (APPS_SCRIPT_URL) {
                await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(winnerDataWithPrize) });
                console.log('SUCCESS: Winner data sent to Google Sheet.');
            }
        } catch (sheetError) {
            console.error('GOOGLE SHEET ERROR: Could not send data.', sheetError);
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

if (closeThankYouPopupButton) { closeThankYouPopupButton.addEventListener('click', hideThankYouPopup); }
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
        document.querySelector(`.tab-panel[data-tab="${targetTab}"]`).classList.add('active');
        if (targetTab === 'winner' && localState && localState.status === 'finished' && userRole !== 'admin') {
             winnerBanner.classList.add('zoomed-in');
        }
    });
});

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

// App को शुरू करें
initializeApp();

const logoutButton = document.getElementById('logout-button');

// अगर यूजर एडमिन है, तो लॉगआउट बटन दिखाएं
if (userRole === 'admin') {
    logoutButton.style.display = 'inline-block';
}

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            // लॉग आउट सफल हुआ
            console.log('User signed out successfully.');
            // यूजर को लॉगिन पेज पर भेजें
            window.location.href = 'admin_login.html';
        })
        .catch((error) => {
            // कोई एरर आई
            console.error('Sign out error:', error);
        });
});

// --- END: यहाँ तक कॉपी करें ---