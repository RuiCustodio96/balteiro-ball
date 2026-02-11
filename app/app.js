fetch("app/jogos.json")
  .then(res => res.json())
  .then(data => {
    renderTeams(calcTeams(data.jogos));
    renderPlayers(calcPlayers(data));
    renderGames(data.jogos);
  });

const players = {};

function calcTeams(jogos) {
  const teams = {
    Branco: { J: 0, V: 0, E: 0, D: 0, GM: 0, GS: 0, P: 0 },
    Preto:  { J: 0, V: 0, E: 0, D: 0, GM: 0, GS: 0, P: 0 }
  };

  jogos.forEach(j => {
    teams.Branco.J++;
    teams.Preto.J++;

    teams.Branco.GM += j.branco;
    teams.Branco.GS += j.preto;
    teams.Preto.GM += j.preto;
    teams.Preto.GS += j.branco;

    if (j.branco > j.preto) {
      teams.Branco.V++; teams.Branco.P += 3;
      teams.Preto.D++;
    } else if (j.branco < j.preto) {
      teams.Preto.V++; teams.Preto.P += 3;
      teams.Branco.D++;
    } else {
      teams.Branco.E++; teams.Preto.E++;
      teams.Branco.P++; teams.Preto.P++;
    }
  });

  return teams;
}

function calcPlayers(data) {

  data.presencas.forEach(p => {
    if (!players[p.jogador]) {
      players[p.jogador] = { J: 0, V: 0, E: 0, D: 0, P: 0 };
    }

    const jogo = data.jogos.find(j => j.data === p.data);
    if (!jogo) return;

    players[p.jogador].J++;

    const ganhou =
      (p.equipa === "Branco" && jogo.branco > jogo.preto) ||
      (p.equipa === "Preto"  && jogo.preto > jogo.branco);

    const perdeu =
      (p.equipa === "Branco" && jogo.branco < jogo.preto) ||
      (p.equipa === "Preto"  && jogo.preto < jogo.branco);

    if (ganhou) {
      players[p.jogador].V++;
      players[p.jogador].P += 3;
    } else if (perdeu) {
      players[p.jogador].D++;
    } else {
      players[p.jogador].E++;
      players[p.jogador].P += 1;
    }
  });

  return players;
}

function renderTeams(teams) {
  const tbody = document.querySelector("#teams tbody");
  Object.entries(teams).forEach(([name, t]) => {
    tbody.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${t.J}</td>
        <td>${t.V}</td>
        <td>${t.E}</td>
        <td>${t.D}</td>
        <td>${t.GM}</td>
        <td>${t.GS}</td>
        <td>${t.P}</td>
      </tr>
    `;
  });
}

function renderPlayers(players) {
  const tbody = document.querySelector("#players tbody");

const sorted = Object.entries(players)
  .sort((a, b) => {
    const pa = a[1];
    const pb = b[1];

    // 1. Pontos (desc)
    if (pb.P !== pa.P) return pb.P - pa.P;

    // 2. Vitórias (desc)
    if (pb.V !== pa.V) return pb.V - pa.V;
 
    // 3. Derrotas (asc) → menos derrotas fica acima
    //TODO: Rever
    //if (pa.D !== pb.D) return pa.D - pb.D;

   
    // 4. Jogos (desc) opcional – quem jogou mais fica acima
    if (pb.J !== pa.J) return pb.J - pa.J;

    // 5. Nome (estável)
    return a[0].localeCompare(b[0]);
  });

  sorted.forEach(([name, p], i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${name}</td>
        <td>${p.J}</td>
        <td>${p.V}</td>
        <td>${p.E}</td>
        <td>${p.D}</td>
        <td>${p.P}</td>
      </tr>
    `;
  });
}

function gerarEquipas() {
  const nomes = document.getElementById("player-input").value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n);

  if (nomes.length !== 14) {
    alert("Por favor, escreve exatamente 14 jogadores.");
    return;
  }

  // Calcula média de pontos
  const todosPontos = Object.values(players).map(p => p.P);
  const mediaPontos = todosPontos.reduce((a,b) => a+b,0) / todosPontos.length;

  // Array de jogadores com pontos
  const jogadores = nomes.map(nome => {
    const pontosReais = players[nome]?.P;
    const usaMedia = pontosReais === undefined;
    return { nome,
    pontos: usaMedia ? mediaPontos : pontosReais,
    primeiraVez: usaMedia };
  });

  // Shuffle para variar a distribuição inicial
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }
  const shuffled = shuffle([...jogadores]);

  // Divide em 2 equipas de 7
  let pretos = shuffled.slice(0,7);
  let brancos = shuffled.slice(7,14);

  // Calcula total de pontos
  const totalPts = t => t.reduce((acc, j) => acc + j.pontos, 0);

  const GAP = 2; // diferença máxima aceitável

  // Tenta balancear trocando jogadores
  let maxIter = 100;
  while (maxIter-- > 0) {
    const ptsA = totalPts(pretos);
    const ptsB = totalPts(brancos);
    const diff = Math.abs(ptsA - ptsB);
    
    if (diff <= GAP) break; // dentro do gap, aceitamos

    // Troca jogador de maior para outro time para reduzir diferença
    let swapped = false;
    for (let i = 0; i < 7 && !swapped; i++) {
      for (let j = 0; j < 7 && !swapped; j++) {
        const newA = [...pretos];
        const newB = [...brancos];
        // troca i e j
        [newA[i], newB[j]] = [newB[j], newA[i]];
        const newDiff = Math.abs(totalPts(newA) - totalPts(newB));
        if (newDiff < diff) {
          pretos = newA;
          brancos = newB;
          swapped = true;
        }
      }
    }
    if (!swapped) break; // não consegue melhorar
  }

  // Atualiza HTML
  const ulA = document.getElementById("pretos-list");
  const ulB = document.getElementById("brancos-list");
  ulA.innerHTML = "";
  ulB.innerHTML = "";

  let ptsA = 0, ptsB = 0;
  pretos.forEach(j => {
  const info = j.primeiraVez ? "1ª vez" : `${j.pontos} pts`;
  ulA.innerHTML += `<li>${j.nome} (${info})</li>`;
  ptsA += j.pontos;
});

brancos.forEach(j => {
  const info = j.primeiraVez ? "1ª vez" : `${j.pontos} pts`;
  ulB.innerHTML += `<li>${j.nome} (${info})</li>`;
  ptsB += j.pontos;
});

  document.getElementById("pretos-points").textContent = ptsA;
  document.getElementById("brancos-points").textContent = ptsB;
}

function renderGames(jogos){
  const tbody = document.querySelector("#games tbody");

  jogos
    .sort((a,b)=> new Date(b.data)-new Date(a.data))
    .forEach(j=>{
      tbody.innerHTML += `
        <tr>
          <td>${j.data}</td>
          <td>${j.branco}</td>
          <td>vs</td>
          <td>${j.preto}</td>
        </tr>
      `;
    });
}