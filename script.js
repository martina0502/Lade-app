let entries = [];

// ---------------------------------------------------------
// Daten laden
// ---------------------------------------------------------
async function loadEntries() {
    try {
        const response = await fetch('entries.json');
        const data = await response.json();
        entries = data;

        recalcAll();
        renderTable();
        renderSummary();
    } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
    }
}

// ---------------------------------------------------------
// Alle Werte neu berechnen (falls nötig)
// ---------------------------------------------------------
function recalcAll() {
    entries.forEach(e => {
        // Falls du später Berechnungen ergänzen willst
        // bleibt diese Funktion dafür zuständig.
    });
}

// ---------------------------------------------------------
// Tabelle rendern
// ---------------------------------------------------------
function renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    entries.forEach((e, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${e.datum}</td>
            <td>${e.ort}</td>
            <td>${e.vor}</td>
            <td>${e.nach}</td>
            <td>${e.diffProzent}</td>
            <td>${e.diffKW}</td>
            <td>${e.gefahreneKm}</td>
            <td>${e.rechnkw}</td>
            <td>${e.gesamtMinuten}</td>
            <td>${e.eurokw}</td>
            <td>${e.dieselKosten}</td>
            <td>${e.diffDieselKW}</td>
        `;

        tableBody.appendChild(row);
    });
}

// ---------------------------------------------------------
// Auswertung rendern (mit deinen neuen Erweiterungen)
// ---------------------------------------------------------
function renderSummary() {
    let sumDiffKW = 0;
    let sumKm = 0;
    let sumRechnKW = 0;
    let sumMin = 0;
    let sumDiesel = 0;
    let sumDiffDieselKW = 0;

    entries.forEach(e => {
        sumDiffKW += e.diffKW;
        sumKm += e.gefahreneKm;
        sumRechnKW += e.rechnkw;
        sumMin += e.gesamtMinuten;
        sumDiesel += e.dieselKosten;
        sumDiffDieselKW += e.diffDieselKW;
    });

    // Neue Summen
    let sumEuroKW = entries.reduce((sum, e) => sum + e.eurokw, 0);
    let sumStunden = (sumMin / 60).toFixed(2);
    let avgVerbrauchKWh100km = sumKm > 0 ? ((sumRechnKW / sumKm) * 100).toFixed(2) : 0;

    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = `
        <p><strong>Summe kWh:</strong> ${sumRechnKW.toFixed(2)}</p>
        <p><strong>Summe € kW:</strong> ${sumEuroKW.toFixed(2)}</p>
        <p><strong>Durchschnittlicher Verbrauch:</strong> ${avgVerbrauchKWh100km} kWh / 100 km</p>
        <p><strong>Gesamtladedauer:</strong> ${sumStunden} Stunden</p>
        <p><strong>Gefahrene Kilometer:</strong> ${sumKm}</p>
        <p><strong>Dieselkosten gesamt:</strong> ${sumDiesel.toFixed(2)}</p>
        <p><strong>Diesel kW Differenz:</strong> ${sumDiffDieselKW.toFixed(2)}</p>
    `;
}

// ---------------------------------------------------------
// Neuer Eintrag hinzufügen (falls du das nutzt)
// ---------------------------------------------------------
function addEntry(newEntry) {
    entries.push(newEntry);
    recalcAll();
    renderTable();
    renderSummary();
}

// ---------------------------------------------------------
// Start
// ---------------------------------------------------------
loadEntries();
