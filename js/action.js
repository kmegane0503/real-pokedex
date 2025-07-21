let pokemonList = [];
let startPokemonIndex = 0;
let pokemonCnt = 0;
let currentNo = 0;

function loadModal() {
  fetch("./modalDetail.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("modal-container").innerHTML = html;
    });
}

function loadGenerationTabs() {
  var csvPath = "./data/geneList.csv";
  fetch(csvPath)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n").slice(1); // ヘッダーを除く
      const tabList = document.getElementById("generationTabs");

      lines.forEach((line, index) => {
        const [label, visible, csvFile] = line.split(",");

        const li = document.createElement("li");
        li.className = "nav-item";

        const button = document.createElement("button");
        button.className = "nav-link";
        button.textContent = label;

        if (visible === "1") {
          if (index === 0) button.classList.add("active");
          button.setAttribute("data-bs-toggle", "tab");
          button.setAttribute("data-csv", csvFile);
          button.onclick = () => {
            loadPokemonCSV(`./data/${csvFile}.csv`);
          };
        } else {
          button.classList.add("disabled"); // 非表示はクリックできない
        }

        li.appendChild(button);
        tabList.appendChild(li);
      });
    });
}

function loadPokemonCSV(csvPath) {
  pokemonList = [];
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
  document.getElementById("pokedex-body").innerHTML = "";
  const tbody = document.getElementById('pokedex-body');
  let html = '';

  var kobetsuHtml = "";
  var befNo = "";
  pokemonCnt = 0;
  pokemonList.forEach((p, index) => {
    if (index == 0) {
      startPokemonIndex = Number(p.No) - 1;
      pokemonCnt = startPokemonIndex;
    } else if (index > 0 && p.No != befNo) {
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
      <td class="text-center" style="width:100px;">
        <img src="${image}" style="height:60px;" onerror="this.style.display='none'; document.getElementById('coming-soon-msg-${p.No}').style.display='block';">
        <div id="coming-soon-msg-${p.No}" class="text-muted fw-bold" style="display: none;">Coming soon</div>
      </td>
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
  document.getElementById("modal-real").style.display = "";
  document.getElementById("modal-coming-soon-msg").style.display = "none";

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
  if (currentNo <= startPokemonIndex) {
    currentNo = pokemonCnt;
  } else if (currentNo > pokemonCnt) {
    currentNo = startPokemonIndex + 1;
  }

  currentNo = currentNo.toString().padStart(4, "0");
  const pokemons = pokemonList.filter(pokemon => pokemon.No === currentNo);
  updateModalContent(pokemons);
}

// ページ読み込み後に自動実行（HTMLに <script defer> がある前提）
document.addEventListener("DOMContentLoaded", () => {
    loadModal();
    loadGenerationTabs();
    loadPokemonCSV("./data/gene001.csv");
});
