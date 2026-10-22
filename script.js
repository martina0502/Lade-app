let entries = [];

// ---------------------------------------------------------
// Daten laden
// ---------------------------------------------------------
async function loadEntries() {
    try {
        const response = await fetch("entries.json");
        entries = await response.json();
        renderTable();
        renderSummary();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

// ---------------------------------------------------------
// Neuen Eintrag hinzufügen
// ---------------------------------------------------------
function addNewEntry() {
    const datum = document.getElementById("datum").value;
    const ort = document.getElementById("ort").value;
    const vor = Number(document.getElementById("vor").value);
    const nach = Number(document.getElementById("nach").value);
    const kmvor = Number(document.getElementById("kmvor").value);
    const minuten = Number(document.getElementById("minuten").value);
    const eurokw = Number(document.getElementById("eurokw").value);

    const diffProzent = nach - vor;
    const diffKW = (diffProzent / 100) * 77; // Beispiel: 77 kWh Batterie
    const gefahreneKm = kmvor;
    const rechnkw = diffKW;
    const dieselKosten = diffKW * 0.20;
    const diffDieselKW = dieselKosten - eurokw;

    const newEntry = {
        datum,
        ort,
        vor,
        nach,
        diffProzent,
        diffKW,
        kmvor,
        gefahreneKm,
        rechnkw,
        gesamtMinuten: minuten,
        eurokw,
        dieselKosten,
        diffDieselKW
    };

    entries.push(newEntry);
    renderTable();
    renderSummary();
}

// ---------------------------------------------------------
// Eintrag löschen
// ---------------------------------------------------------
function deleteEntry(index) {
    entries.splice(index, 1);
    renderTable();
    renderSummary();
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
            <td>${e.diffKW.toFixed(2)}</td>
            <td>${e.kmvor}</td>
            <td>${e.gefahreneKm}</td>
            <td>${e.rechnkw.toFixed(2)}</td>
            <td>${e.gesamtMinuten}</td>
            <td>${e.eurokw.toFixed(2)}</td>
            <td>${e.dieselKosten.toFixed(2)}</td>
            <td>${e.diffDieselKW.toFixed(2)}</td>
            <td>
                <button onclick="deleteEntry(${index})">Löschen</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// ---------------------------------------------------------
// Auswertung rendern
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

    let sumEuroKW = entries.reduce((sum, e) => sum + e.eurokw, 0);
    let sumStunden = (sumMin / 60).toFixed(2);
    let avgVerbrauchKWh100km = sumKm > 0 ? ((sumRechnKW / sumKm) * 100).toFixed(2) : 0;

    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = `
        <p><strong>Summe kWh:</strong> ${sumRechnKW.toFixed(2)}</p>
        <p><strong>Summe € kW:</strong> ${sumEuroKW.toFixed(2)}</p>
        <p><strong>Durchschnittlicher Verbrauch:</strong> ${avgVerbrauchKWh100km} kWh / 100 km</p>
        <p><strong>Gesamtladedauer:</strong> ${sumStunden} Stunden</p>
        <p><strong>Gefahrene Kilometer:</strong> ${sumKm}</p>
        <p><strong>Dieselkosten gesamt:</strong> ${sumDiesel.toFixed(2)}</p>
        <p><strong>Diesel-Diff gesamt:</strong> ${sumDiffDieselKW.toFixed(2)}</p>
    `;
}

loadEntries();
