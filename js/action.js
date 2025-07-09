let pokemonList = [];
let currentIndex = 0;

function loadModal() {
  fetch("./modalDetail.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("modal-container").innerHTML = html;
    });
}

function loadPokemonCSV(csvPath) {
  fetch(csvPath)
    .then(response => response.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1); // skip header
      pokemonList = rows.map(row => {
        const [No, Name, Rating, Comment] = row.split(",");
        return { No, Name, Rating, Comment };
      });
      displayTable();
    });
}

function displayTable() {
  const tbody = document.getElementById('pokedex-body');
  let html = '';

  pokemonList.forEach((p, index) => {
    html += `<tr onclick="openModal(${index})" style="cursor:pointer">
      <td class="text-end" style="width:40px;">${p.No}</td>
      <td class="text-start" style="width:80px;">${p.Name}</td>
      <td class="text-center" style="width:100px;"><img src="./images/real/${p.No}.png" style="height:60px;"></td>
      <td class="text-center" style="width:100px;">${p.Rating}</td>
      <td class="text-start">${p.Comment}</td>
    </tr>`;
  });

  document.getElementById("pokedex-body").innerHTML = html;
}

let currentModal = null;
function openModal(index) {
  currentIndex = index;
  const p = pokemonList[index];

  updateModalContent(p)

  currentModal = new bootstrap.Modal(document.getElementById("pokemonModal"));
  currentModal.show();

  document.getElementById("prevBtn").onclick = () => navigateModal(-1);
  document.getElementById("nextBtn").onclick = () => navigateModal(1);
}

function updateModalContent(p) {
  document.getElementById("pokemonModalLabel").innerText = `${p.No} ${p.Name}`;
  document.getElementById("modal-real").src = `images/real/${p.No}.png`;
  document.getElementById("modal-comment").innerText = `評価: ${p.Rating} ／ コメント: ${p.Comment}`;
}

function navigateModal(step) {
  currentIndex = (currentIndex + step + pokemonList.length) % pokemonList.length;
  const p = pokemonList[currentIndex];
  updateModalContent(p);
}

// ページ読み込み後に自動実行（HTMLに <script defer> がある前提）
document.addEventListener("DOMContentLoaded", () => {
    loadModal();
    loadPokemonCSV("./data/gene001.csv");
});
