let entries = [];
let editIndex = null;

// ---------------------------------------------------------
// WICHTIG: Erst laden, wenn DOM fertig ist
// ---------------------------------------------------------
window.addEventListener("DOMContentLoaded", loadEntries);

// ---------------------------------------------------------
// Daten laden – zuerst LocalStorage, dann JSON
// ---------------------------------------------------------
async function loadEntries() {

    // 1. LocalStorage prüfen
    const saved = localStorage.getItem("entries");
    if (saved) {
        entries = JSON.parse(saved);
        renderTable();
        renderSummary();
        return;
    }

    // 2. JSON laden, wenn LocalStorage leer ist
    try {
        const response = await fetch("entries.json?cb=" + Date.now(), {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error("entries.json konnte nicht geladen werden");
        }

        const data = await response.json();
        entries = Array.isArray(data) ? data : [data];

        // JSON in LocalStorage übernehmen
        localStorage.setItem("entries", JSON.stringify(entries));

        renderTable();
        renderSummary();
    } catch (e) {
        console.error("Fehler beim Laden:", e);
    }
}

// ---------------------------------------------------------
// Minuten in Stunden:Minuten Format
// ---------------------------------------------------------
function minutesToTimeString(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
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
    const rechnkw = Number(document.getElementById("rechnkw").value);
    const stunden = Number(document.getElementById("stunden").value);
    const minuten = Number(document.getElementById("minuten").value);
    const eurokw = Number(document.getElementById("eurokw").value);

    // gefahrene KM automatisch
    let gefahreneKm = 0;
    if (entries.length > 0) {
        const previousKm = entries[entries.length - 1].kmvor;
        gefahreneKm = kmvor - previousKm;
    }

    // Dieselberechnung
    const dieselPreis = 2.24;
    const verbrauchProKm = 7 / 100;
    const dieselEuro = gefahreneKm * verbrauchProKm * dieselPreis;

    // Ladezeit
    const gesamtMinuten = stunden * 60 + minuten;

    // Differenzen
    const diffProzent = nach - vor;
    const diffKW = diffProzent * 0.6;
    const diffDieselKW = diffKW - dieselEuro;

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
        gesamtMinuten,
        eurokw,
        dieselKosten: dieselEuro.toFixed(2),
        diffDieselKW: diffDieselKW.toFixed(2)
    };

    entries.push(newEntry);

    // SPEICHERN!
    localStorage.setItem("entries", JSON.stringify(entries));

    renderTable();
    renderSummary();
}

// ---------------------------------------------------------
// Tabelle anzeigen
// ---------------------------------------------------------
function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    entries.forEach((e, index) => {

        // Diesel Diff € = DieselKosten – EuroKW
        const dieselDiffEuro = (Number(e.dieselKosten ?? 0) - Number(e.eurokw ?? 0)).toFixed(2);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${e.datum ?? ""}</td>
            <td>${e.ort ?? ""}</td>
            <td>${e.vor ?? 0}</td>
            <td>${e.nach ?? 0}</td>
            <td>${e.diffProzent ?? 0}</td>
            <td>${Number(e.diffKW ?? 0).toFixed(2)}</td>
            <td>${e.kmvor ?? 0}</td>
            <td>${e.gefahreneKm ?? 0}</td>
            <td>${e.rechnkw ?? 0}</td>
            <td>${minutesToTimeString(e.gesamtMinuten ?? 0)}</td>
            <td>${e.eurokw ?? 0}</td>
            <td>${Number(e.dieselKosten ?? 0).toFixed(2)}</td>
            <td>${Number(e.diffDieselKW ?? 0).toFixed(2)}</td>

            <!-- NEU: Diesel Diff € -->
            <td>${dieselDiffEuro}</td>

            <!-- Löschen -->
            <td><button onclick="deleteEntry(${index})">Löschen</button></td>
        `;

        tbody.appendChild(row);
    });
}

// ---------------------------------------------------------
// Zusammenfassung anzeigen
// ---------------------------------------------------------
function renderSummary() {

    // Grundsummen
    const totalKm = entries.reduce((sum, e) => sum + (e.gefahreneKm ?? 0), 0);
    const totalDiesel = entries.reduce((sum, e) => sum + Number(e.dieselKosten ?? 0), 0);

    // Rechn. kWh
    const totalRechnKW = entries.reduce((sum, e) => sum + Number(e.rechnkw ?? 0), 0);

    // Summe € kWh
    const totalEuroKW = entries.reduce((sum, e) => sum + Number(e.eurokw ?? 0), 0);

    // Ladezeit
    const totalMinutes = entries.reduce((sum, e) => sum + Number(e.gesamtMinuten ?? 0), 0);
    const totalHoursDecimal = totalMinutes / 60;

    // Diesel-Diff gesamt
    const totalDiffDieselKW = entries.reduce((sum, e) => sum + Number(e.diffDieselKW ?? 0), 0);

    // Durchschnittlicher Verbrauch (kWh/100 km)
    const avgConsumptionKWh = totalKm > 0 ? (totalRechnKW * 100) / totalKm : 0;

    // Durchschnittlicher Verbrauch (€ kWh / 100 km)
    const avgConsumptionEuro = totalKm > 0 ? (totalEuroKW * 100) / totalKm : 0;



// Durchschnittliche Reichweite
const range100 = avgConsumptionKWh > 0
    ? (66.5 * 100) / avgConsumptionKWh
    : 0;

const range80 = avgConsumptionKWh > 0
    ? ((66.5 * 0.8) * 100) / avgConsumptionKWh
    : 0;





    // Ausgabe
    document.getElementById("summary").innerHTML = `
        <h3>Auswertung</h3>

        <p>Gesamt gefahrene KM: <b>${totalKm}</b></p>

        <p>Durchschnittlicher Verbrauch (kWh/100 km): 
            <b>${avgConsumptionKWh.toFixed(2)}</b>
        </p>

        <p>Durchschnittlicher Verbrauch (€ kWh / 100 km): 
            <b>${avgConsumptionEuro.toFixed(2)}</b>
        </p>

<p>Durchschnittliche Reichweite bei 100% Ladung: 
<b>${range100.toFixed(0)} km</b>
</p>

<p>Durchschnittliche Reichweite bei 80% Ladung: 
<b>${range80.toFixed(0)} km</b>
</p>



        <hr>

        <p>Summe kWh (geladen / Rechn. kWh): 
            <b>${totalRechnKW.toFixed(2)}</b>
        </p>

        <p>Summe € kWh: 
            <b>${totalEuroKW.toFixed(2)}</b>
        </p>

        <p>Gesamtladedauer (Stunden, dezimal): 
            <b>${totalHoursDecimal.toFixed(2)}</b>
        </p>

        <p>Gesamt Diesel €: <b>${totalDiesel.toFixed(2)}</b></p>

        <p>Diesel‑Diff gesamt: 
            <b>${totalDiffDieselKW.toFixed(2)}</b>
        </p>
    `;
}

// ---------------------------------------------------------
// Eintrag löschen
// ---------------------------------------------------------
function deleteEntry(index) {
    entries.splice(index, 1);

    // SPEICHERN!
    localStorage.setItem("entries", JSON.stringify(entries));

    renderTable();
    renderSummary();
}
