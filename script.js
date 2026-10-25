let entries = [];
let editIndex = null;

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
    const nach = Number(document.getElementById("nach").value); // optional, kann später entfernt werden
    const kmvor = Number(document.getElementById("kmvor").value);
    const rechnkw = Number(document.getElementById("rechnkw").value);
    const stunden = Number(document.getElementById("stunden").value);
    const minuten = Number(document.getElementById("minuten").value);
    const eurokw = Number(document.getElementById("eurokw").value);

    // ---------------------------------------------------------
    // Gefahrene KM automatisch berechnen
    // ---------------------------------------------------------
    let gefahreneKm = 0;

    if (entries.length > 0) {
        const previousKm = entries[entries.length - 1].kmvor;
        gefahreneKm = kmvor - previousKm;
    }

    // ---------------------------------------------------------
    // Dieselberechnung
    // ---------------------------------------------------------
    const dieselPreis = 2.24;
    const verbrauchProKm = 7 / 100;
    const dieselEuro = gefahreneKm * verbrauchProKm * dieselPreis;

    // ---------------------------------------------------------
    // Ladezeit berechnen
    // ---------------------------------------------------------
    const ladezeit = `${stunden}h ${minuten}m`;

    // ---------------------------------------------------------
    // % Differenz und kW Differenz
    // ---------------------------------------------------------
    const diff = nach - vor;
    const diffkw = diff * 0.6; // falls du echten Wert willst, sag Bescheid

    // ---------------------------------------------------------
    // Eintrag erzeugen
    // ---------------------------------------------------------
    const newEntry = {
        datum,
        ort,
        vor,
        nach,
        diff,
        diffkw,
        kmvor,
        gefahreneKm,
        rechnkw,
        ladezeit,
        eurokw,
        diesel: dieselEuro.toFixed(2)
    };

    entries.push(newEntry);
    renderTable();
    renderSummary();
}
