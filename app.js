fetch("data/jogos.json")
  .then(res => res.json())
  .then(data => {
    renderTeams(calcTeams(data.jogos));
    renderPlayers(calcPlayers(data));
  });

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
  const players = {};

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
    .sort((a, b) => b[1].P - a[1].P);

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
