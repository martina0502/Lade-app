let entries = [];
let editIndex = null;

// ---------------------------------------------------------
// WICHTIG: Erst laden, wenn DOM fertig ist
// ---------------------------------------------------------
window.addEventListener("DOMContentLoaded", loadEntries);

// ---------------------------------------------------------
// Daten laden (GitHub Pages kompatibel)
// ---------------------------------------------------------
async function loadEntries() {
    try {
        const response = await fetch("entries.json?cb=" + Date.now(), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("entries.json konnte nicht geladen werden");
        }

        let data = await response.json();

        // JSON automatisch in Array umwandeln
        if (!Array.isArray(data)) {
            data = [data];
        }

        // fehlende Felder automatisch ergänzen
        data = data.map(entry => ({
            datum: entry.datum || "",
            ort: entry.ort || "",
            vor: entry.vor || 0,
            nach: entry.nach || 0,
            diff: (entry.nach ?? 0) - (entry.vor ?? 0),
            diffkw: ((entry.nach ?? 0) - (entry.vor ?? 0)) * 0.6,
            kmvor: entry.kmvor || 0,
            gefahreneKm: entry.gefahreneKm || 0,
            rechnkw: entry.rechnkw || 0,
            ladezeit: entry.ladezeit || "",
            eurokw: entry.eurokw || 0,
            diesel: entry.diesel || 0
        }));

        entries = data;

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
    const ladezeit = `${stunden}h ${minuten}m`;

    // % Differenz
    const diff = nach - vor;
    const diffkw = diff * 0.6;

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

// ---------------------------------------------------------
// Tabelle anzeigen
// ---------------------------------------------------------
function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    entries.forEach((e, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${e.datum}</td>
            <td>${e.ort}</td>
            <td>${e.vor}</td>
            <td>${e.nach}</td>
            <td>${e.diff}</td>
            <td>${e.diffkw.toFixed(2)}</td>
            <td>${e.kmvor}</td>
            <td>${e.gefahreneKm}</td>
            <td>${e.rechnkw}</td>
            <td>${e.ladezeit}</td>
            <td>${e.eurokw}</td>
            <td>${e.diesel}</td>
            <td><button onclick="deleteEntry(${index})">Löschen</button></td>
        `;

        tbody.appendChild(row);
    });
}

// ---------------------------------------------------------
// Zusammenfassung anzeigen
// ---------------------------------------------------------
function renderSummary() {
    let totalKm = entries.reduce((sum, e) => sum + e.gefahreneKm, 0);
    let totalDiesel = entries.reduce((sum, e) => sum + Number(e.diesel), 0);

    document.getElementById("summary").innerHTML = `
        <h3>Zusammenfassung</h3>
        <p>Gesamt gefahrene KM: <b>${totalKm}</b></p>
        <p>Gesamt Diesel €: <b>${totalDiesel.toFixed(2)}</b></p>
    `;
}

// ---------------------------------------------------------
// Eintrag löschen
// ---------------------------------------------------------
function deleteEntry(index) {
    entries.splice(index, 1);
    renderTable();
    renderSummary();
}
