const cargarSelect = () => {
  const unidades = [
    "Seleccione Moneda",
    "uf",
    "ivp",
    "dolar",
    "euro",
    "ipc",
    "utm",
    "imacec",
    "tpm",
    "bitcoin",
  ];
  //  const unidades =['uf', 'ivp', 'dolar', 'dolar_intercambio', 'euro', 'ipc', 'utm', 'imacec', 'tpm', 'libra_cobre', 'tasa_desempleo', 'bitcoin']

  let html = "";
  for (let unid of unidades) {
    html += `<option value="${unid}">${unid}</option>`;
  }
  const ele = document.querySelector("#miSelect");
  ele.innerHTML = html;
};
cargarSelect();

const btnCalc = document.querySelector("#btnCalcular");
btnCalc.addEventListener("click", function () {
  var combo = document.querySelector("#miSelect");
  var selected = combo.options[combo.selectedIndex].text;
  console.log(selected)
  if (selected == 'Seleccione Moneda') {
     Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Debe seleccionar una moneda, para continuar",
      });
  } else {
    calcularValor(selected);
    renderGrafica(selected);
  }

});

const calcularValor = async (selected) => {
  const valorEntrada = Number(document.querySelector("#valorEntrada").value);
  const resultado = document.querySelector("#result");

  if (valorEntrada <= 0) {
    Swal.fire("Ingrese un valor mayor a 0, para continuar.");
  } else {
    try {
      const url = "https://mindicador.cl/api/" + selected;
      const response = await fetch(url); //peticion
      const data = await response.json(); // convertir respuesta a json

      resultado.innerHTML = `$${Intl.NumberFormat().format(
        valorEntrada / data.serie[0].valor
      )}`;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  }
};

// grafica
async function getMonedas(selected) {
  try {
    const endpoint = "https://mindicador.cl/api/" + selected;
    const res = await fetch(endpoint);
    const monedas = await res.json();
    return monedas.serie.slice(0, 10);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
  }
}

function prepararConfiguracionParaLaGrafica(monedas) {
  // Creamos las variables necesarias para el objeto de configuración
  var combo = document.querySelector("#miSelect");
  var selected = combo.options[combo.selectedIndex].text;

  const tipoDeGrafica = "line";
  //console.log((monedas[0].fecha.split('T')[0]));
  const nombresFechas = monedas.map((moneda) => moneda.fecha.split("T")[0]);
  const titulo = `Historial últimos 10 registros, ${selected.toUpperCase()}`;
  const colorDeLinea = "red";
  const valores = monedas.map((moneda) => {
    const valor = moneda.valor;
    return Number(valor);
  });
  // Creamos el objeto de configuración usando las variables anteriores
  const config = {
    type: tipoDeGrafica,
    data: {
      labels: nombresFechas,
      datasets: [
        {
          label: titulo,
          backgroundColor: colorDeLinea,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.0,
          data: valores,
        },
      ],
    },
  };
  return config;
}

let chartInstance = null;
async function renderGrafica(selected) {
  const monedas = await getMonedas(selected);
  const config = prepararConfiguracionParaLaGrafica(monedas);
  const chartDOM = document.getElementById("myChart");
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(chartDOM, config);
}
