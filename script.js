// --- START OF THE 100% COMPLETE SCRIPT.JS FILE ---

// 1. Firebase कॉन्फ़िगरेशन पेस्ट करें
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

// 2. Firebase को इनिशियलाइज़ करें
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const gameStateRef = database.ref('drawState');

// --- स्प्लैश स्क्रीन और सामान्य UI ---
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
    }, 6000);
});

const API_URL = 'https://script.google.com/macros/s/AKfycbz2tIumCHYpvaRyFXiceh_qd4R-d45Dj9wV-27IQ5QzFjd1Kx5KFLY7u8MzMpqbEVbIMg/exec';

const subtitleText = document.getElementById('subtitle-text');
const drawButton = document.getElementById('draw-button');
const urlParams = new URLSearchParams(window.location.search);
const userRole = urlParams.get('role');

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

const ITEM_HEIGHT = 100;
const REEL_LENGTH = 1000;
const totalRounds = 26;

const prizeConfig = [
    { range: [1, 20], prize: "Dinner Set", image: "Prizeimages/prize_dinner_set.jpg" },
    { range: [21, 23], prize: "LED TV", image: "Prizeimages/prize_led_tv.jpeg" },
    { range: [24, 25], prize: "Refrigerator", image: "Prizeimages/prize_fridge.png" },
    { range: [26, 26], prize: "Motorcycle (Mega Prize)", image: "Prizeimages/prize_bike.png" }
];

function getPrizeDetails(round) {
    if (round > totalRounds) return null;
    return prizeConfig.find(config => round >= config.range[0] && round <= config.range[1]);
}

const translations = {
    hi: { 
        subtitle: "दिवाली स्पेशल लकी ड्रा", button: "विजेता चुनें!", winner_title: "विजेता", tab_winner: "परिणाम पेज", tab_participants: "हमारे बारे में", search_heading: "अपनी एंट्री जांचें", search_subheading: "अपनी एंट्री खोजने के लिए अपना मोबाइल नंबर या कूपन कोड दर्ज करें।", search_placeholder: "मोबाइल या कूपन कोड दर्ज करें...", search_button: "खोजें", searching: "खोज रहे हैं...", entry_found: "बधाई हो! आपकी एंट्री मिल गई है।", no_entry: "इस विवरण के साथ कोई एंट्री नहीं मिली।", empty_input: "कृपया खोजने के लिए कुछ दर्ज करें।", about_heading: "उत्कृष्टता के प्रति हमारी प्रतिबद्धता", about_p1: "हिंदुस्तान पेट्रोलियम कॉर्पोरेशन लिमिटेड (एचपीसीएल) भारत की अग्रणी तेल और गैस कंपनियों में से एक है...", about_p2: "यह लकी ड्रा एचपीसीएल को चुनने के लिए आपका धन्यवाद कहने का हमारा तरीका है...",
        winners_list_heading: "लकी ड्रा विजेता",
        th_round: "राउंड",
        th_prize: "पुरस्कार",
        th_name: "विजेता का नाम",
        th_coupon: "कूपन कोड",
        th_outlet: "आउटलेट",
        th_address: "आउटलेट का पता",
        th_mobile: "मोबाइल",
        countdown_heading: "लकी ड्रॉ कुछ ही पलों में शुरू होने वाला है, कृपया पेज पर बने रहें।",
        countdown_days: "दिन",
        countdown_hours: "घंटे",
        countdown_minutes: "मिनट",
        countdown_seconds: "सेकंड",
        draw_live_message: "ड्रॉ शुरू हो चुका है! अपना भाग्य आज़माने के लिए रिजल्ट पेज पर बने रहें।"
    },
    en: { 
        subtitle: "Diwali Special Lucky Draw", button: "Reveal the Winner", winner_title: "Winner", tab_winner: "Result Page", tab_participants: "About Us", search_heading: "Check Your Coupen Code", search_subheading: "Enter your Mobile Number or Coupon Code to find your entry.", search_placeholder: "Enter Mobile or Coupon Code...", search_button: "Search", searching: "Searching...", entry_found: "Congratulations! Your entry has been found.", no_entry: "No entry found with these details.", empty_input: "Please enter something to search.", about_heading: "Our Commitment to Excellence", about_p1: "Hindustan Petroleum Corporation Limited (HPCL) is one of India's leading oil and gas companies...", about_p2: "This lucky draw is our way of saying thank you for choosing HPCL...",
        winners_list_heading: "Lucky Draw Winners",
        th_round: "Round",
        th_prize: "Prize",
        th_name: "Winner Name",
        th_coupon: "Coupon Code",
        th_outlet: "Outlet",
        th_address: "Outlet Address",
        th_mobile: "Mobile",
        countdown_heading: "The lucky draw is about to begin, please stay on this page.",
        countdown_days: "Days",
        countdown_hours: "Hours",
        countdown_minutes: "Minutes",
        countdown_seconds: "Seconds",
        draw_live_message: "The draw has started! Stay on the Result Page to try your luck."
    }
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

    langHi.classList.toggle('active', lang === 'hi');
    langEn.classList.toggle('active', lang === 'en');
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

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allParticipants = data.map(p => ({ ...p, isWinner: false, prize: null }));

        const winnersRef = database.ref('winners');
        const snapshot = await winnersRef.get();
        if (snapshot.exists()) {
            const winnersData = snapshot.val();
            Object.values(winnersData).forEach(winner => {
                const index = allParticipants.findIndex(p => p.CouponCode === winner.CouponCode);
                if (index !== -1) {
                    allParticipants[index].isWinner = true;
                }
            });
        }
        console.log("Data and past winners loaded successfully.");
    } catch (error) {
        console.error('Data loading error:', error);
        subtitleText.innerText = "Error: Could not load data.";
    }
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
            const customerName = result['CustomerName'] || 'N/A';
            const customerPhone = result['CustomerPhone'] || 'N/A';
            const vehicleNumber = result['VehicleNumber'] || 'N/A';
            const couponCode = result['CouponCode'] || 'N/A';
            const pumpName = result['PumpName'] || 'N/A';
            searchResultContainer.innerHTML = `<div class="result-message success">${translations[currentLang].entry_found}</div><div class="result-card"><p><strong>Outlet Name:</strong> ${pumpName}</p><p><strong>Customer Name:</strong> ${customerName}</p><p><strong>Mobile Number:</strong> ${String(customerPhone).substring(0, 2) + '******' + String(customerPhone).substring(String(customerPhone).length - 2)}</p><p><strong>Vehicle Number:</strong> ${vehicleNumber}</p><p><strong>Coupon Code:</strong> ${couponCode}</p></div>`;
        } else {
            searchResultContainer.innerHTML = `<div class="result-message error">${translations[currentLang].no_entry}</div>`;
        }
    }, 500);
}

async function fetchAndDisplayWinners() {
    const tableBody = document.getElementById('winners-table-body');
    tableBody.innerHTML = `<tr><td colspan="7" class="loading-message">Loading winners...</td></tr>`;

    try {
        const response = await fetch(`${API_URL}?sheet=winners`);
        const winners = await response.json();
        
        tableBody.innerHTML = ''; 

        if (winners.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">No winners announced yet.</td></tr>`;
            return;
        }

        winners.sort((a, b) => b.Round - a.Round);

        winners.forEach(winner => {
            const mobileDisplay = String(winner.CustomerPhone).substring(0, 2) + '******' + String(winner.CustomerPhone).substring(String(winner.CustomerPhone).length - 2);
            const outletAddress = winner.OutletAddress || 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${winner.Round}</td>
                <td>${winner.Prize}</td>
                <td>${winner.CustomerName}</td>
                <td>${winner.CouponCode}</td>
                <td>${winner.PumpName}</td>
                <td>${outletAddress}</td>
                <td>${mobileDisplay}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching winners:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="no-winners-message">Failed to load winners list. Please try again later.</td></tr>`;
    }
}

function syncUIWithState(state) {
    if (!state || allParticipants.length === 0) return;

    localState = state;
    winnerPopupOverlay.classList.add('hidden');
    publicWinnerCard.classList.add('hidden'); 

    if (state.status === 'waiting') {
        const prize = getPrizeDetails(state.round);
        if (prize) {
            subtitleText.innerText = `Ready for Round ${state.round}/${totalRounds}: ${prize.prize}`;
            if (userRole === 'admin') drawButton.disabled = false;
        } else {
            subtitleText.innerText = `All ${totalRounds} rounds are complete!`;
            if (userRole === 'admin') drawButton.disabled = true;
        }
        initializeReels();
        winnerBanner.classList.remove('zoomed-in'); 
    } else {
        if (userRole === 'admin') drawButton.disabled = true;
    }

    if (state.status === 'countdown') {
        countdownOverlay.classList.remove('hidden', 'slide-down');
        runCountdown(state.countdownValue);
        winnerBanner.classList.remove('zoomed-in'); 
    } else {
        countdownOverlay.classList.add('hidden');
    }

    if (state.status === 'spinning' && state.winnerCoupon) {
        winnerBanner.classList.add('zoomed-in');
        beginReelSpin(state.winnerCoupon);
    }

   if (state.status === 'finished' && state.winnerCoupon) {
        const winner = allParticipants.find(p => p.CouponCode === state.winnerCoupon);
        if (winner) {
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
                publicName.innerText = winner.CustomerName;
                publicCoupon.innerText = winner.CouponCode;
                publicOutlet.innerText = winner.PumpName;
                publicAddress.innerText = outletAddress;
                publicMobile.innerText = mobileDisplay;
                publicWinnerCard.classList.remove('hidden');
                winnerBanner.classList.add('zoomed-in'); 
            }
        }
    }
}

// ===== START: यहाँ बदलाव किया गया है =====
function handleAdminClick() {
    drawButton.disabled = true;

    // स्टेप 1: उन सभी आउटलेट्स की सूची बनाएं जो पहले ही जीत चुके हैं।
    const pastWinners = allParticipants.filter(p => p.isWinner);
    const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));

    // स्टेप 2: योग्य प्रतिभागियों को फ़िल्टर करें।
    // योग्य वही है जो (1) खुद विजेता नहीं है और (2) जिसका आउटलेट पहले नहीं जीता है।
    const eligibleParticipants = allParticipants.filter(p => {
        return !p.isWinner && !winningOutletNames.has(p.PumpName);
    });

    if (eligibleParticipants.length === 0) {
        // अगर कोई योग्य प्रतिभागी नहीं बचा है तो एक मैसेज दिखाएं।
        alert("ड्रॉ के लिए कोई योग्य प्रतिभागी या आउटलेट नहीं बचा है!");
        drawButton.disabled = false;
        return;
    }

    // स्टेप 3: केवल योग्य प्रतिभागियों में से एक रैंडम विजेता चुनें।
    const winner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];

    // बाकी का कोड पहले जैसा ही रहेगा...
    gameStateRef.set({
        status: 'countdown',
        round: localState.round,
        winnerCoupon: winner.CouponCode,
        countdownValue: 10
    }).then(() => {
        let count = 10;
        const countdownInterval = setInterval(() => {
            count--;
            if (count >= 0) {
                gameStateRef.update({ countdownValue: count });
            } else {
                gameStateRef.update({ status: 'spinning' });
                clearInterval(countdownInterval);
            }
        }, 1200);
    });
}
// ===== END: यहाँ बदलाव किया गया है =====

function runCountdown(currentNumber) {
    countdownNumber.innerText = currentNumber > 0 ? currentNumber : 'GO!';
    countdownNumber.style.fontSize = currentNumber > 0 ? '40vmin' : '30vmin';
    if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.play();
    }
}

function beginReelSpin(winnerCoupon) {
    if (reelCoupon.classList.contains('spinning')) return;
    reelCoupon.classList.add('spinning');
    
    // ===== रील के लिए भी केवल योग्य प्रतिभागियों को दिखाएं =====
    const pastWinners = allParticipants.filter(p => p.isWinner);
    const winningOutletNames = new Set(pastWinners.map(winner => winner.PumpName));
    const eligibleParticipantsForReel = allParticipants.filter(p => {
        return !p.isWinner && !winningOutletNames.has(p.PumpName);
    });

    document.getElementById('draw-sound').play();
    let reel = startContinuousReel(reelCoupon, eligibleParticipantsForReel, 'CouponCode', 10);
    
    setTimeout(() => {
        stopReel(reel, winnerCoupon, 5);
        setTimeout(() => {
            document.getElementById('draw-sound').pause();
            if (userRole === 'admin') {
                gameStateRef.update({ status: 'finished' });
            }
        }, 5500);
    }, 5000);
}

function announceWinner(winner, round) {
    if (userRole !== 'admin') return;
    currentWinner = winner;
    const prizeDetail = getPrizeDetails(round);
    popupHeading.innerText = `Winner of Round ${round}: ${prizeDetail.prize}!`; 
    prizeImage.src = prizeDetail.image;
    popupName.innerText = winner.CustomerName;
    popupCoupon.innerText = winner.CouponCode;
    popupOutlet.innerText = winner.PumpName;
    popupAddress.innerText = winner.OutletAddress || 'N/A';
    let mobileDisplay = String(winner.CustomerPhone);
    popupMobile.innerText = mobileDisplay.substring(0, 2) + '******' + mobileDisplay.substring(mobileDisplay.length - 2);
    winnerPopupOverlay.classList.remove('hidden');
    saveNextButton.disabled = false;
    saveNextButton.innerText = `Save & Ready for Round ${round + 1}`;
}

async function handleSaveClick() {
    if (userRole !== 'admin' || !currentWinner) return;
    saveNextButton.disabled = true;
    saveNextButton.innerText = 'Saving...';
    
    const originalIndex = allParticipants.findIndex(p => p.CouponCode === currentWinner.CouponCode);
    if (originalIndex !== -1) {
        allParticipants[originalIndex].isWinner = true;
    }

    const isSaved = await saveWinnerData(currentWinner, localState.round);
    if (isSaved) {
        fetchAndDisplayWinners();
        gameStateRef.set({
            status: 'waiting',
            round: localState.round + 1,
            winnerCoupon: null,
            countdownValue: null
        });
    } else {
        alert("Error saving data! Please try again.");
        saveNextButton.disabled = false;
        saveNextButton.innerText = `Save & Ready for Round ${localState.round + 1}`;
    }
}

async function handleResetClick() {
    if (!confirm("Are you sure you want to reset the draw to the last safe point?")) return;
    console.log("Resetting draw state...");
    const winnersRef = database.ref('winners');
    const snapshot = await winnersRef.get();
    let lastCompletedRound = 0;
    if (snapshot.exists()) {
        const winnersData = snapshot.val();
        const rounds = Object.values(winnersData).map(winner => winner.Round);
        if (rounds.length > 0) {
            lastCompletedRound = Math.max(...rounds);
        }
    }
    const nextRound = lastCompletedRound + 1;
    console.log(`Resetting to start of round ${nextRound}.`);
    gameStateRef.set({
        status: 'waiting',
        round: nextRound,
        winnerCoupon: null,
        countdownValue: null
    });
}

async function initializeApp() {
    startCountdown();
    await fetchData();
    fetchAndDisplayWinners(); 
    gameStateRef.on('value', (snapshot) => {
        const state = snapshot.val();
        if (state) {
            syncUIWithState(state);
        }
    });
    const snapshot = await gameStateRef.get();
    if (snapshot.exists()) {
        syncUIWithState(snapshot.val());
    } else if (userRole === 'admin') {
        handleResetClick();
    }
}

function initializeReels() {
    const defaultText = '<div class="reel-item">READY TO DRAW</div>';
    reelCoupon.innerHTML = defaultText;
    reelCoupon.style.transform = 'translateY(0px)';
    document.querySelectorAll('.reel-box').forEach(box => {
        box.style.border = '3px solid #FFD700';
    });
    reelCoupon.classList.remove('spinning');
}

function startContinuousReel(reelElement, participantsArray, key, speed) {
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
        reelElement.style.transform = `translateY(-${rollDistance - (ITEM_HEIGHT * FINAL_ITEMS_COUNT)}px)`; 
    }, 100);
    return { reelElement, FINAL_ITEMS_COUNT }; 
}

function stopReel(reelObject, finalValue, stopTimeInSeconds) {
    const { reelElement, FINAL_ITEMS_COUNT } = reelObject;
    
    const TARGET_POS_IN_FINAL_CHUNK = 49; 
    const TOTAL_ITEMS_IN_REEL = reelElement.querySelectorAll('.reel-item').length;
    
    const FINAL_POS_INDEX = TOTAL_ITEMS_IN_REEL - FINAL_ITEMS_COUNT + TARGET_POS_IN_FINAL_CHUNK; 
    
    let items = reelElement.querySelectorAll('.reel-item');
    if (items.length > FINAL_POS_INDEX) {
        items[FINAL_POS_INDEX].textContent = finalValue;
        items[FINAL_POS_INDEX].classList.add('final-winner');
    }
    
    const finalScrollPosition = FINAL_POS_INDEX * ITEM_HEIGHT; 
    
    setTimeout(() => {
        reelElement.style.transition = `transform ${stopTimeInSeconds}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        reelElement.style.transform = `translateY(-${finalScrollPosition}px)`;
        setTimeout(() => {
            reelElement.parentElement.parentElement.style.border = '3px solid #d9232d';
            document.getElementById('winner-sound').play(); 
        }, stopTimeInSeconds * 1000);
    }, 100);
}

async function saveWinnerData(winner, round) {
    try {
        const prizeDetail = getPrizeDetails(round);
        const winnerDataWithPrize = { ...winner, Round: round, Prize: prizeDetail.prize, Timestamp: new Date().toISOString() };
        const winnerRef = database.ref('winners/' + winner.CouponCode);
        await winnerRef.set(winnerDataWithPrize);
        console.log('SUCCESS: Winner saved to Firebase.');
        
        try {
            console.log("Attempting to save winner to Google Sheet...");
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(winnerDataWithPrize) 
            });
            console.log('SUCCESS: Winner data sent to Google Sheet.');
        } catch (sheetError) {
            console.error('GOOGLE SHEET ERROR:', sheetError);
        }
        return true;
    } catch (error) {
        console.error('FIREBASE ERROR:', error);
        return false;
    }
}

// --- Event Listeners ---
if (userRole === 'admin') {
    drawButton.addEventListener('click', handleAdminClick);
    saveNextButton.addEventListener('click', handleSaveClick);
    resetButton.style.display = 'inline-block';
    resetButton.addEventListener('click', handleResetClick);
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
        document.querySelector(`.tab-panel[data-tab="${targetTab}"]`).classList.add('active');
        
        if (targetTab === 'winner' && localState && localState.status === 'finished' && userRole !== 'admin') {
             winnerBanner.classList.add('zoomed-in');
        }
    });
});

initializeApp();

// --- END OF THE FINAL, COMPLETE SCRIPT.JS FILE ---