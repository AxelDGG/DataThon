document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("zipFile");
  const file = fileInput.files[0];

  if (!file) return alert("Selecciona un archivo ZIP o RAR.");

  const reader = new FileReader();

  reader.onload = function (e) {
    alert("Simulando análisis del archivo subido. Aquí iría lógica backend real.");

    // Resultado simulado (mock)
    const data = [
      { banco: "Banco A", exitos: 90, intentos: 100, comision: 0.02, dias: 7 },
      { banco: "Banco B", exitos: 70, intentos: 100, comision: 0.015, dias: 10 },
      { banco: "Banco C", exitos: 50, intentos: 100, comision: 0.01, dias: 12 }
    ];

    const tbody = document.querySelector("#tablaResultados tbody");
    tbody.innerHTML = "";
    let maxScore = -Infinity;
    let bancoTarget = "-";

    data.forEach(b => {
      const porcentaje = b.exitos / b.intentos;
      const scoreEfectividad = porcentaje / b.dias;
      const scoreCosto = porcentaje / (b.comision * b.dias);

      if (scoreEfectividad > maxScore) {
        maxScore = scoreEfectividad;
        bancoTarget = b.banco;
      }

      const row = `<tr>
        <td>${b.banco}</td>
        <td>${b.exitos}</td>
        <td>${b.intentos}</td>
        <td>${(porcentaje * 100).toFixed(1)}%</td>
        <td>${(b.comision * 100).toFixed(2)}%</td>
        <td>${b.dias}</td>
        <td>${scoreEfectividad.toFixed(4)}</td>
        <td>${scoreCosto.toFixed(2)}</td>
      </tr>`;
      tbody.innerHTML += row;
    });

    document.getElementById("bancoTarget").innerText = bancoTarget;
  };

  reader.readAsArrayBuffer(file); // Simulación, no análisis real aún
});
