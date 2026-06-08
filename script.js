const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwHueTkIIyoi-8jcuQpjJeXoy8b6C_59qLCOiaELA9GX6Z62JGp-_cyBANFIIfZYoU/exec"; 

window.onload = function() {
    fetchNextBillNumber();
    document.getElementById('date').valueAsDate = new Date();
};

async function fetchNextBillNumber() {
    try {
        const response = await fetch(WEB_APP_URL);
        const nextId = await response.text();
        document.getElementById('billNo').value = nextId;
    } catch (err) {
        document.getElementById('billNo').value = "ATC-1001"; 
    }
}

document.getElementById('lorryNo').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(amount);
}

function updateBalance() {
    const cap = parseFloat(document.getElementById('capacity').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const freight = cap * rate;
    document.getElementById('freight').value = freight.toFixed(2);

    const comm = parseFloat(document.getElementById('comm').value) || 0;
    const rtgs = parseFloat(document.getElementById('rtgs').value) || 0;
    const cutting = parseFloat(document.getElementById('cutting').value) || 0;
    const shortage = parseFloat(document.getElementById('shortage').value) || 0;

    const netAccount = freight - (comm + rtgs + cutting + shortage);
    document.getElementById('inAccountDisplay').innerText = "₹ " + formatINR(netAccount);
    return { freight, netAccount };
}

document.querySelectorAll('input[type="number"]').forEach(el => {
    el.addEventListener('input', updateBalance);
});

document.getElementById('atcForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const { freight, netAccount } = updateBalance();

    const data = {
        billNo: document.getElementById('billNo').value,
        date: document.getElementById('date').value,
        lorryNo: document.getElementById('lorryNo').value,
        party: document.getElementById('party').value,
        material: document.getElementById('material').value || "N/A",
        from: document.getElementById('from').value,
        to: document.getElementById('to').value,
        freight: freight.toFixed(2),
        comm: document.getElementById('comm').value,
        rtgs: document.getElementById('rtgs').value,
        cutting: document.getElementById('cutting').value,
        shortage: document.getElementById('shortage').value,
        inAccount: netAccount.toFixed(2),
        remark: document.getElementById('remark').value || "N/A"
    };

    // Fill PDF Template
    document.getElementById('p-bill').innerText = data.billNo;
    document.getElementById('p-date').innerText = data.date;
    document.getElementById('p-lorry').innerText = data.lorryNo;
    document.getElementById('p-party').innerText = data.party;
    document.getElementById('p-from').innerText = data.from;
    document.getElementById('p-to').innerText = data.to;
    document.getElementById('p-material').innerText = data.material;
    document.getElementById('p-freight').innerText = formatINR(data.freight);
    document.getElementById('p-comm').innerText = formatINR(data.comm);
    document.getElementById('p-rtgs').innerText = formatINR(data.rtgs);
    document.getElementById('p-cutting').innerText = formatINR(data.cutting);
    document.getElementById('p-shortage').innerText = formatINR(data.shortage);
    document.getElementById('p-total').innerText = formatINR(data.inAccount);
    document.getElementById('p-remark').innerText = data.remark;

    btn.innerText = "Processing...";
    btn.disabled = true;

    setTimeout(async () => {
        try {
            const element = document.getElementById('pdf-content');
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `ATC_${data.billNo}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();

            fetch(WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(data)
            });

            alert("Success: PDF Downloaded & Saved!");
            document.getElementById('atcForm').reset();
            document.getElementById('inAccountDisplay').innerText = "₹ 0.00";
            fetchNextBillNumber();
        } catch (err) {
            console.error(err);
            alert("Error generating PDF!");
        } finally {
            btn.disabled = false;
            btn.innerText = "Save Data & Download PDF";
        }
    }, 500); 
});