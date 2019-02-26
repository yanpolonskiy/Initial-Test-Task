const API_URL =
  "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48";

const TBODY = document.querySelector("#table-body");
const DOMODEDOVO_COORDS = [55.414722, 37.900278];
const KNOT_COEFICIENT = 1.852;
const FOOT_COEFICIENT = 3.281;

class Api {
  constructor() {
    this.getPlanesData = this.getPlanesData.bind(this);
  }
  url = API_URL;

  getPlanesData() {
    const myHeaders = new Headers();
    const init = {
      method: "GET",
      headers: myHeaders,
      mode: "cors",
      cache: "default"
    };
    return fetch(this.url, init);
  }
}

const api = new Api();
updateTable();
setInterval(updateTable, 4000);

/**
 * @param {Object} принимает объект из апи
 * @returns {Object[]} возвращает массив массивов данных из апи
 * @description переводит объект полученный из апи в массив
 */
function prepareData(data) {
  const dataArray = [];
  for (key in data) {
    if (typeof data[key] === "object") dataArray.push(data[key]);
  }
  dataArray.sort((a, b) => {
    const aDistance = getDistanceToDomodedovo([a[1], a[2]]);
    const bDistance = getDistanceToDomodedovo([b[1], b[2]]);
    return aDistance - bDistance;
  });

  return dataArray;
}
/**
 * @param {Object[]} принимает массив массивов данных из апи
 * @description добавляет данные в таблицу
 */
function addDataToTable(data) {
  data.forEach((p, index) => {
    const tr = document.createElement("tr");
    const tdDatas = [];
    const speed = p[5] * KNOT_COEFICIENT;
    const height = p[4] * FOOT_COEFICIENT;
    tdDatas.push(
      `${p[1]}, ${p[2]}`,
      speed.toFixed(2),
      p[3],
      height.toFixed(2),
      p[11],
      p[12],
      `${p[13]}/${p[16]}`
    );
    tdDatas.forEach(d => {
      const td = document.createElement("td");
      td.innerHTML = d;
      tr.appendChild(td);
    });
    if (TBODY.children[index]) {
      TBODY.replaceChild(tr, TBODY.children[index]);
    } else {
      TBODY.appendChild(tr);
    }
    if (index === data.length - 1 && TBODY.children.length - 1 > index) {
      for (let i = index + 1; i < TBODY.children.length; i++) {
        TBODY.removeChild(TBODY.children[i]);
      }
    }
  });
}

function getDistanceToDomodedovo(coords) {
  return Math.sqrt(
    Math.pow(coords[0] - DOMODEDOVO_COORDS[0], 2) +
      Math.pow(coords[1] - DOMODEDOVO_COORDS[1], 2)
  );
}

function updateTable() {
  api
    .getPlanesData()
    .then(resp => resp.json())
    .then(result => prepareData(result))
    .then(data => addDataToTable(data));
}
function clearTable() {
  while (TBODY.lastChild) {
    TBODY.removeChild(TBODY.lastChild);
  }
}
