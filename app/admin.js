const HASH_NIF = "cbbdfec3ce2fed0f608e960e24893ff4a511b92da4db8c0ee108d6c23b75b797";

async function login() {
  const nif = document.getElementById("access").value;
  const hash = await sha256(nif);

  if (hash === HASH_NIF) {
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
  const res = await fetch("app/jogos.json");
  const json = await res.json();

  const data = document.getElementById("data").value;
  const branco = Number(document.getElementById("branco").value);
  const preto = Number(document.getElementById("preto").value);
  const linhas = document.getElementById("jogadores").value.split("\n");

  json.jogos.push({ data, branco, preto });

  linhas.forEach(l => {
    const [jogador, equipa] = l.split(",");
    if (!jogador || !equipa) return;

    json.presencas.push({
      data,
      jogador: jogador.trim(),
      equipa: equipa.trim()
    });
  });

  document.getElementById("output").value =
    JSON.stringify(json, null, 2);
}
