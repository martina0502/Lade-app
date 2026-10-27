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
            

            <!-- NEU: Diesel Diff € -->
            <td>${dieselDiffEuro}</td>

            <!-- Löschen -->
            <td><button onclick="deleteEntry(${index})">Löschen</button></td>
        `;

        tbody.appendChild(row);
    });
}


function renderDashboard(
    totalKm,
    avgConsumptionKWh,
    avgConsumptionEuro,
    range100,
    range80
) {

    document.getElementById("dashboard").innerHTML = `

        <div class="card">

            <div style="text-align:center;">

                <img src="tacho.svg"
                     style="width:40px;height:40px;margin-bottom:10px;">

                <h2 style="margin:0;">
                    Gesamt gefahrene KM
                </h2>

                <div style="
                    font-size:36px;
                    font-weight:bold;
                    color:#1e3a5f;
                    margin-top:10px;
                ">
                    ${totalKm}
                </div>

            </div>

            <div style="
                height:1px;
                background:#e5e5e5;
                margin:20px 0;
            "></div>

            <h2 style="
                margin-top:0;
                margin-bottom:20px;
                text-align:left;
            ">
                📊 Durchschnittswerte
            </h2>

            <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                gap:15px;
            ">

                <div class="card">
                    <div style="text-align:center;">

                        <img src="icon-512.png"
                             style="width:40px;height:40px;margin-bottom:10px;">

                        <div><strong>Strom</strong></div>

                        <div style="
                            font-size:26px;
                            font-weight:bold;
                        ">
                            ${avgConsumptionKWh.toFixed(2)}
                        </div>

                        <div>kWh / 100 km</div>

                    </div>
                </div>

                <div class="card">
                    <div style="text-align:center;">

                        <div style="font-size:40px;">💰</div>

                        <div><strong>Stromkosten</strong></div>

                        <div style="
                            font-size:26px;
                            font-weight:bold;
                        ">
                            ${avgConsumptionEuro.toFixed(2)}
                        </div>

                        <div>€ / 100 km</div>

                    </div>
                </div>

                <div class="card">
                    <div style="text-align:center;">

                        <div style="font-size:40px;">🔋</div>

                        <div><strong>Reichweite bei 100 %</strong></div>

                        <div style="
                            font-size:26px;
                            font-weight:bold;
                        ">
                            ${range100.toFixed(0)} km
                        </div>

                    </div>
                </div>

                <div class="card">
                    <div style="text-align:center;">

                        <div style="font-size:40px;">🔋</div>

                        <div><strong>Reichweite bei 80 %</strong></div>

                        <div style="
                            font-size:26px;
                            font-weight:bold;
                        ">
                            ${range80.toFixed(0)} km
                        </div>

                    </div>
                </div>

            </div>

        </div>

    `;
}

//monatliche Auswertung
function renderMonthlySummary() {

    const monthlyGroups = {};

    entries.forEach(e => {

        if (!e.datum) return;

        const date = new Date(e.datum);

        const monthKey =
            date.toLocaleString("de-DE", {
                month: "long",
                year: "numeric"
            });

        if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = [];
        }

        monthlyGroups[monthKey].push(e);
    });

    let html = `<h2>📅 Monatsauswertung</h2>`;

    Object.keys(monthlyGroups)
        .reverse()
        .forEach(month => {

            const monthEntries = monthlyGroups[month];

            const km =
                monthEntries.reduce(
                    (s, e) => s + Number(e.gefahreneKm ?? 0),
                    0
                );

            const kwh =
                monthEntries.reduce(
                    (s, e) => s + Number(e.rechnkw ?? 0),
                    0
                );

            const euro =
                monthEntries.reduce(
                    (s, e) => s + Number(e.eurokw ?? 0),
                    0
                );

            const avgKwh =
                km > 0
                    ? (kwh * 100) / km
                    : 0;

            const avgEuro =
                km > 0
                    ? (euro * 100) / km
                    : 0;

            const range100 =
                avgKwh > 0
                    ? (66.5 * 100) / avgKwh
                    : 0;

            const range80 =
                avgKwh > 0
                    ? ((66.5 * 0.8) * 100) / avgKwh
                    : 0;

            html += `

            <div class="card">

                <h3>${month}</h3>

                <div style="
                    display:grid;
                    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                    gap:15px;
                ">

                    <div class="card">
                        <div style="text-align:center;">
                            <img src="tacho.svg"
                                 style="width:40px;height:40px;margin-bottom:10px;">
                            <div><strong>Kilometer</strong></div>
                            <div style="font-size:24px;font-weight:bold;">
                                ${km}
                            </div>
                            <div>km</div>
                        </div>
                    </div>

                    <div class="card">
                        <div style="text-align:center;">
                            <img src="icon-512.png"
                                 style="width:40px;height:40px;margin-bottom:10px;">
                            <div><strong>Strom</strong></div>
                            <div style="font-size:24px;font-weight:bold;">
                                ${avgKwh.toFixed(2)}
                            </div>
                            <div>kWh / 100 km</div>
                        </div>
                    </div>

                    <div class="card">
                        <div style="text-align:center;">
                            <div style="font-size:40px;">💰</div>
                            <div><strong>Stromkosten</strong></div>
                            <div style="font-size:24px;font-weight:bold;">
                                ${avgEuro.toFixed(2)}
                            </div>
                            <div>€ / 100 km</div>
                        </div>
                    </div>

                    <div class="card">
                        <div style="text-align:center;">
                            <div style="font-size:40px;">🔋</div>
                            <div><strong>100 %</strong></div>
                            <div style="font-size:24px;font-weight:bold;">
                                ${range100.toFixed(0)} km
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div style="text-align:center;">
                            <div style="font-size:40px;">🔋</div>
                            <div><strong>80 %</strong></div>
                            <div style="font-size:24px;font-weight:bold;">
                                ${range80.toFixed(0)} km
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            `;
        });

    document.getElementById("monthlySummary").innerHTML = html;
}




// ---------------------------------------------------------
// Zusammenfassung anzeigen
// ---------------------------------------------------------
function renderSummary() {

    const totalKm =
        entries.reduce(
            (sum, e) => sum + (e.gefahreneKm ?? 0),
            0
        );

    const totalDiesel =
        entries.reduce(
            (sum, e) => sum + Number(e.dieselKosten ?? 0),
            0
        );

    const totalRechnKW =
        entries.reduce(
            (sum, e) => sum + Number(e.rechnkw ?? 0),
            0
        );

    const totalEuroKW =
        entries.reduce(
            (sum, e) => sum + Number(e.eurokw ?? 0),
            0
        );

    const totalMinutes =
        entries.reduce(
            (sum, e) => sum + Number(e.gesamtMinuten ?? 0),
            0
        );

    const totalHoursDecimal =
        totalMinutes / 60;

    const totalDieselDiffEuro =
        entries.reduce((sum, e) => {
            return sum +
                (
                    Number(e.dieselKosten ?? 0)
                    - Number(e.eurokw ?? 0)
                );
        }, 0);

    const avgConsumptionKWh =
        totalKm > 0
            ? (totalRechnKW * 100) / totalKm
            : 0;

    const avgConsumptionEuro =
        totalKm > 0
            ? (totalEuroKW * 100) / totalKm
            : 0;

    const range100 =
        avgConsumptionKWh > 0
            ? (66.5 * 100) / avgConsumptionKWh
            : 0;

    const range80 =
        avgConsumptionKWh > 0
            ? ((66.5 * 0.8) * 100) / avgConsumptionKWh
            : 0;

    renderDashboard(
        totalKm,
        avgConsumptionKWh,
        avgConsumptionEuro,
        range100,
        range80
    );

    renderMonthlySummary();

    document.getElementById("summary").innerHTML = `
        <h2>📈 Gesamtvergleich Strom - Diesel</h2>

        <p>
            <img src="icon-512.png"
                 style="width:20px;height:20px;vertical-align:middle;margin-right:5px;">
            <strong>Summe Strom</strong>
        </p>

        <p>
            ${totalRechnKW.toFixed(2)} kWh |
            ${totalEuroKW.toFixed(2)} € |
            ${totalHoursDecimal.toFixed(2)} h
        </p>

        <br>

        <p>
            ⛽ <strong>Summe Diesel</strong>
        </p>

        <p>
            ${totalDiesel.toFixed(2)} €
        </p>

        <br>

        <p>
            💰 <strong>Differenz Diesel</strong>
        </p>

        <p>
            ${totalDieselDiffEuro.toFixed(2)} €
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
