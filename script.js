
async function loadEntries() {
    try {
        const response = await fetch('entries.json');
        const data = await response.json();
        entries = data;
        recalcAll();
        renderTable();
    } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
    }
}




document.addEventListener("DOMContentLoaded", () => {
    recalcAll();
    renderTable();
});

let entries = [
    {
        datum: "2026-10-09",
        ort: "Sieg",
        vor: 0,
        nach: 100,
        diffProzent: 100,
        diffKW: 0,
        kmvor: 31145,
        gefahreneKm: 0,
        rechnkw: 0,
        gesamtMinuten: 0,
        eurokw: 0,
        dieselKosten: 0,
        diffDieselKW: 0
    },
    {
        datum: "2026-10-10",
        ort: "WAGO",
        vor: 42,
        nach: 87,
        diffProzent: 45,
        diffKW: 29.93,
        kmvor: 31335,
        gefahreneKm: 190,
        rechnkw: 33.46,
        gesamtMinuten: 187,
        eurokw: 6.69,
        dieselKosten: 29.79,
        diffDieselKW: 23.10
    },
    {
        datum: "2026-10-14",
        ort: "WAGO",
        vor: 33,
        nach: 83,
        diffProzent: 50,
        diffKW: 33.25,
        kmvor: 31518,
        gefahreneKm: 183,
        rechnkw: 36.66,
        gesamtMinuten: 204,
        eurokw: 7.33,
        dieselKosten: 28.69,
        diffDieselKW: 21.36
    },
    {
        datum: "2026-10-16",
        ort: "Edeka Bück CCS 0,48",
        vor: 72,
        nach: 80,
        diffProzent: 8,
        diffKW: 5.32,
        kmvor: 31543,
        gefahreneKm: 25,
        rechnkw: 5.2,
        gesamtMinuten: 9,
        eurokw: 2.50,
        dieselKosten: 3.92,
        diffDieselKW: 1.42
    },
    {
        datum: "2026-10-17",
        ort: "WAGO",
        vor: 76,
        nach: 100,
        diffProzent: 24,
        diffKW: 15.96,
        kmvor: 31574,
        gefahreneKm: 31,
        rechnkw: 18.91,
        gesamtMinuten: 114,
        eurokw: 3.78,
        dieselKosten: 4.86,
        diffDieselKW: 1.08
    }
];

let editIndex = null;

function addEntry() {
    if (editIndex !== null) {
        updateEntry();
        return;
    }

    const entry = readForm();
    entries.push(entry);
    recalcAll();
    renderTable();
    clearForm();
}

function readForm() {
    const datum = document.getElementById("datum").value;
    const ort = document.getElementById("ort").value;
    const vor = Number(document.getElementById("vor").value);
    const nach = Number(document.getElementById("nach").value);
    const kmvor = Number(document.getElementById("kmvor").value);
    const rechnkw = Number(document.getElementById("rechnkw").value);
    const stunden = Number(document.getElementById("stunden").value);
    const minuten = Number(document.getElementById("minuten").value);
    const eurokw = Number(document.getElementById("eurokw").value);

    const diffProzent = nach - vor;
    let diffKW = 66.5 * (diffProzent / 100);

    if (editIndex === 0 || (editIndex === null && entries.length === 0)) {
        diffKW = 0;
    }

    let gefahreneKm = 0;

    if (editIndex !== null) {
        gefahreneKm = editIndex > 0 ? kmvor - entries[editIndex - 1].kmvor : 0;
    } else {
        gefahreneKm = entries.length > 0 ? kmvor - entries[entries.length - 1].kmvor : 0;
    }

    const gesamtMinuten = stunden * 60 + minuten;
    const dieselKosten = ((7 * gefahreneKm) / 100) * 2.24;
    const diffDieselKW = dieselKosten - eurokw;

    return {
        datum, ort, vor, nach, diffProzent, diffKW,
        kmvor, gefahreneKm, rechnkw,
        gesamtMinuten, eurokw, dieselKosten, diffDieselKW
    };
}

function editEntry(index) {
    editIndex = index;
    const e = entries[index];

    document.getElementById("datum").value = e.datum;
    document.getElementById("ort").value = e.ort;
    document.getElementById("vor").value = e.vor;
    document.getElementById("nach").value = e.nach;
    document.getElementById("kmvor").value = e.kmvor;
    document.getElementById("rechnkw").value = e.rechnkw;
    document.getElementById("stunden").value = Math.floor(e.gesamtMinuten / 60);
    document.getElementById("minuten").value = e.gesamtMinuten % 60;
    document.getElementById("eurokw").value = e.eurokw;
}

function updateEntry() {
    const updated = readForm();
    entries[editIndex] = updated;
    editIndex = null;
    recalcAll();
    renderTable();
    clearForm();
}

function deleteEntry(index) {
    if (!confirm("Diesen Eintrag wirklich löschen?")) return;

    entries.splice(index, 1);
    recalcAll();
    renderTable();
}


function recalcAll() {
    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];

        e.diffProzent = e.nach - e.vor;
        e.diffKW = i === 0 ? 0 : 66.5 * (e.diffProzent / 100);
        e.gefahreneKm = i === 0 ? 0 : e.kmvor - entries[i - 1].kmvor;
        e.dieselKosten = ((7 * e.gefahreneKm) / 100) * 2.24;
        e.diffDieselKW = e.dieselKosten - e.eurokw;
    }
}

function renderTable() {
    const table = document.getElementById("table");
    if (!table) return;

    const tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

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
            <td>${e.rechnkw}</td>
            <td>${e.gesamtMinuten} Min</td>
            <td>${e.eurokw.toFixed(2)}</td>
            <td>${e.dieselKosten.toFixed(2)}</td>
            <td>${e.diffDieselKW.toFixed(2)}</td>
            <td>
    <button onclick="editEntry(${index})">Bearbeiten</button>
    <button onclick="deleteEntry(${index})" style="color:red;">Löschen</button>
</td>
        `;

        tbody.appendChild(row);
    });

    renderSummary();
}

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

    document.getElementById("sumKm").innerText = sumKm;
    document.getElementById("sumDiffKW").innerText = sumDiffKW.toFixed(2);
    document.getElementById("verbrauchDiffKW").innerText = sumKm > 0 ? ((sumDiffKW * 100) / sumKm).toFixed(2) : "0";
    document.getElementById("sumRechnKW").innerText = sumRechnKW.toFixed(2);
    document.getElementById("verbrauchRechnKW").innerText = sumKm > 0 ? ((sumRechnKW * 100) / sumKm).toFixed(2) : "0";

    // Neue Summen
    document.getElementById("sumMin").innerText = sumMin;
    document.getElementById("sumDiesel").innerText = sumDiesel.toFixed(2);
    document.getElementById("sumDiffDieselKW").innerText = sumDiffDieselKW.toFixed(2);
}

function clearForm() {
    document.getElementById("ladeForm").reset();
}
