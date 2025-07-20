let pokemonList = [];
let pokemonCnt = 0;
let currentNo = 0;

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
        const [No, Name, Ver, Rating, Comment] = row.split(",");
        return { No, Name, Ver, Rating, Comment };
      });
      displayTable();
    });
}

function displayTable() {
  const tbody = document.getElementById('pokedex-body');
  let html = '';

  var kobetsuHtml = "";
  var befNo = "";
  pokemonCnt = 0;
  pokemonList.forEach((p, index) => {
    if (index > 0 && p.No != befNo) {
      // 各ポケモン最新バージョンのみ一覧に表示
      html += kobetsuHtml;
      pokemonCnt++;
    }

    var image = `images/real/${p.No}.png`;
    if (p.Ver > 1) {
      image = `images/real/${p.No}_${p.Ver}.png`;
    }

    kobetsuHtml = `<tr onclick="openModal('${p.No}')" style="cursor:pointer">
      <td class="text-end" style="width:40px;">${p.No}</td>
      <td class="text-start" style="width:80px;">${p.Name}</td>
      <td class="text-end" style="width:40px;">${p.Ver}</td>
      <td class="text-center" style="width:100px;"><img src="${image}" style="height:60px;"></td>
      <td class="text-center" style="width:100px;">${p.Rating}</td>
      <td class="text-start">${p.Comment}</td>
    </tr>`;

    befNo = p.No;
  });

  html += kobetsuHtml;
  pokemonCnt++;
  document.getElementById("pokedex-body").innerHTML = html;
}

let currentModal = null;
function openModal(no) {
  currentNo = no;
  const pokemons = pokemonList.filter(pokemon => pokemon.No === no);

  updateModalContent(pokemons)

  currentModal = new bootstrap.Modal(document.getElementById("pokemonModal"));
  currentModal.show();

  document.getElementById("prevBtn").onclick = () => navigateModal(-1);
  document.getElementById("nextBtn").onclick = () => navigateModal(1);
}

function updateModalContent(pokemons) {
  var pokemon = pokemons[0];
  document.getElementById("pokemonModalLabel").innerText = `${pokemon.No} ${pokemon.Name}`;

  pokemons.forEach((p, index) => {
    var image = `images/real/${p.No}.png`;
    if (index > 0) {
      image = `images/real/${p.No}_${index + 1}.png`;
    }
    document.getElementById("modal-version-overlay").innerText = 'Ver.' + p.Ver;
    document.getElementById("modal-real").src = image;
    document.getElementById("modal-comment").innerText = `評価: ${p.Rating} ／ コメント: ${p.Comment}`;
  });
}

function navigateModal(step) {
  currentNo = Number(currentNo) + step;
  if (currentNo <= 0) {
    currentNo = pokemonCnt;
  } else if (currentNo > pokemonCnt) {
    currentNo = 1;
  }

  currentNo = currentNo.toString().padStart(4, "0");
  const pokemons = pokemonList.filter(pokemon => pokemon.No === currentNo);
  updateModalContent(pokemons);
}

// ページ読み込み後に自動実行（HTMLに <script defer> がある前提）
document.addEventListener("DOMContentLoaded", () => {
    loadModal();
    loadPokemonCSV("./data/gene001.csv");
});
