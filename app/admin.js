const HASH_NIF = "cbbdfec3ce2fed0f608e960e24893ff4a511b92da4db8c0ee108d6c23b75b797";

const GITHUB = {
  owner: "RuiCustodio96",
  repo: "balteiro-ball",
  path: "app/jogos.json",
  branch: "main"
};
let GITHUB_TOKEN = null;

function setToken() {
  GITHUB_TOKEN = prompt("Token GitHub:");
}

async function login() {
  const nif = document.getElementById("access").value;
  const hash = await sha256(nif);

  if (hash === HASH_NIF) {
    setToken();
    document.getElementById("login").style.display = "none";
    document.getElementById("panel").style.display = "block";
  } else {
    alert("Inválido");
  }
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function gerarJSON() {
  // Carrega o JSON existente
  const res = await fetch("app/jogos.json");
  const json = await res.json();

  // Dados do novo jogo
  const data = document.getElementById("data").value;
  const golosBranco = Number(document.getElementById("branco-golos").value);
  const golosPreto = Number(document.getElementById("preto-golos").value);

  // Adiciona o novo jogo
  json.jogos.push({ data, branco: golosBranco, preto: golosPreto });

  // Função auxiliar para adicionar jogadores à equipa
  function adicionarJogadores(textareaId, equipa) {
    const linhas = document.getElementById(textareaId).value.split("\n");
    linhas.forEach(nome => {
      const jogador = nome.trim();
      if (!jogador) return; // ignora linhas vazias
      json.presencas.push({ data, jogador, equipa });
    });
  }

  // Adiciona jogadores de cada equipa
  adicionarJogadores("branco", "Branco");
  adicionarJogadores("preto", "Preto");

  // Mostra o JSON atualizado
  document.getElementById("output").value = JSON.stringify(json, null, 2);

}
async function commitJSON(json) {
  const url = "https://api.github.com/repos/RuiCustodio96/balteiro-ball/contents/app/jogos.json";

  // 1️⃣ GET público (SEM AUTH)
  const fileRes = await fetch(url);
  if (!fileRes.ok) {
    alert("Erro a obter ficheiro");
    return;
  }

  const file = await fileRes.json();

  // 2️⃣ PUT autenticado
  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Atualização jogos",
      content: btoa(unescape(encodeURIComponent(document.getElementById("output").value))),
      sha: file.sha,
      branch: "main"
    })
  });

  if (!putRes.ok) {
    console.error(await putRes.text());
    alert("Erro no commit");
    return;
  }

  alert("Commit feito com sucesso!");
}

