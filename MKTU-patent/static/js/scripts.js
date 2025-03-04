document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab")
  const contents = {
    browse: document.getElementById("browseContent"),
    search: document.getElementById("searchContent"),
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"))
      this.classList.add("active")

      Object.values(contents).forEach((content) => content.classList.add("hidden"))
      contents[this.dataset.tab].classList.remove("hidden")
    })
  })

  // Заполнение выпадающего списка классов
  const classSelect = document.getElementById("classSelect")
  for (let i = 1; i <= 45; i++) {
    const option = document.createElement("option")
    option.value = i.toString().padStart(2, "0")
    option.textContent = `${i} класс`
    classSelect.appendChild(option)
  }

  // Обработчики событий
  document.querySelector(".search-button").addEventListener("click", sendSearchRequest)
  document.getElementById("classSelect").addEventListener("change", sendBrowseRequest)
  document.getElementById("niceCheckbox").addEventListener("change", sendBrowseRequest)
  document.querySelector("#searchContent .nice-checkbox").addEventListener("change", sendSearchRequest)

  // Translation form handler
  const translateForm = document.getElementById("translateForm")
  if (translateForm) {
    translateForm.addEventListener("submit", (event) => {
      event.preventDefault()

      const language = document.getElementById("language").value

      const form = document.createElement("form")
      form.method = "POST"
      form.action = "/translate"

      const languageInput = document.createElement("input")
      languageInput.type = "hidden"
      languageInput.name = "language"
      languageInput.value = language

      form.appendChild(languageInput)
      document.body.appendChild(form)

      window.open("", "_blank").document.body.appendChild(form)
      form.submit()
    })
  }
})

function sendBrowseRequest() {
  const classCode = document.getElementById("classSelect").value
  const niceOnly = document.getElementById("niceCheckbox").checked

  console.log("Sending browse request:", { classCode: classCode, niceOnly: niceOnly })

  fetch(`/browse?class=${classCode}&nice_only=${niceOnly}`)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    })
    .then((data) => {
      console.log("Received browse data:", data)
      displayResults(data, "browse")
    })
    .catch((error) => {
      console.error("Error:", error)
      document.getElementById("browse-results").innerHTML = "<p>An error occurred while fetching results.</p>"
    })
}

function sendSearchRequest() {
  const searchInput = document.querySelector(".search-input").value
  const niceCheckbox = document.querySelector("#searchContent .nice-checkbox").checked
  const classCode = document.getElementById("classSelect").value

  console.log("Sending search request:", {
    query: searchInput,
    classCode: classCode,
    niceOnly: niceCheckbox,
  })

  fetch("/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: searchInput, classCode: classCode, niceOnly: niceCheckbox }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    })
    .then((data) => {
      console.log("Received search data:", data)
      displayResults(data, "search")
    })
    .catch((error) => {
      console.error("Error:", error)
      document.getElementById("search-results").innerHTML = "<p>An error occurred while fetching results.</p>"
    })
}

function displayResults(data, type) {
  const resultsContainer = document.getElementById(`${type}-results`)
  const resultCount = document.getElementById(`${type}-result-count`)

  resultsContainer.innerHTML = ""
  resultCount.textContent = data.totalResults

  if (data.totalResults === 0) {
    resultsContainer.innerHTML = "<p>Нет результатов</p>"
  } else {
    const ul = document.createElement("ul")
    data.results.forEach((item) => {
      const li = document.createElement("li")
      li.innerHTML = `
        <a href="#" class="result-item" data-class="${item.class_code}" data-code="${item.code}">
          <strong>Класс:</strong> ${item.class_code}
          <strong>№:</strong> ${item.code}<br>
          <strong>Имя:</strong> ${item.name_ru}<br>
        </a>
      `
      li.querySelector(".result-item").addEventListener("click", (e) => {
        e.preventDefault()
        document.querySelectorAll(".result-item").forEach((item) => {
          item.classList.remove("selected")
        })
        e.target.closest(".result-item").classList.add("selected")
        showClassDetail(item.class_code, item.code)
      })
      ul.appendChild(li)
    })
    resultsContainer.appendChild(ul)
  }
}

function showClassDetail(classCode, itemCode) {
  fetch(`/class/${classCode}`)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    })
    .then((data) => {
      const mainContent = document.querySelector(".content-wrapper")

      let classContainer = document.querySelector(`.class-detail[data-class="${classCode}"]`)

      if (!classContainer) {
        classContainer = document.createElement("div")
        classContainer.classList.add("class-detail")
        classContainer.setAttribute("data-class", classCode)
        classContainer.innerHTML = `
          <div class="class-header">
            <h2>Класс ${classCode}</h2>
            <div class="class-actions">
              <button class="action-button" title="Редактировать класс" onclick="editClass('${classCode}')">
                <img src="/static/images/edit.png" alt="Редактировать">
                <span>Редактировать класс</span>
              </button>
              <button onclick="clearClass('${classCode}')" class="action-button">
                <img src="/static/images/clear.png" alt="">
                Очистить класс
              </button>
              <button class="action-button" title="Проверить приемлемость" onclick="checkAcceptability('${classCode}')">
                <img src="/static/images/datebase.png" alt="Проверить">
                <span>Проверить приемлемость МКТУ</span>
              </button>
            </div>
          </div>
          <div class="class-description">
            <h3>Описание для класса ${classCode}</h3>
            <div class="items-list"></div>
          </div>
        `
        mainContent.appendChild(classContainer)
      }

      const itemsList = classContainer.querySelector(".items-list")

      if (itemsList.querySelector(`[data-item="${itemCode}"]`)) {
        console.warn(`Элемент ${itemCode} уже добавлен в класс ${classCode}`)
        return
      }

      const selectedItem = data.items.find((item) => item.code == itemCode)
      if (!selectedItem) {
        console.warn(`Элемент ${itemCode} не найден в классе ${classCode}`)
        return
      }

      const newItem = document.createElement("div")
      newItem.classList.add("item-row", selectedItem.exists ? "exists" : "not-exists")
      newItem.setAttribute("data-item", itemCode)
      newItem.innerHTML = `
        <div class="item-code">${selectedItem.code}</div>
        <div class="item-name">${selectedItem.name_ru || ""}</div>
      `

      itemsList.appendChild(newItem)
    })
    .catch((error) => {
      console.error("Error:", error)
    })
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const contents = {
    browse: document.getElementById('browseContent'),
    search: document.getElementById('searchContent'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      tabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');

      Object.values(contents).forEach((content) => content.classList.add('hidden'));
      contents[this.dataset.tab].classList.remove('hidden');
    });
  });

  // Заполнение выпадающего списка классов
  const classSelect = document.getElementById('classSelect');
  for (let i = 1; i <= 45; i++) {
    const option = document.createElement('option');
    option.value = i.toString().padStart(2, '0');
    option.textContent = `${i} класс`;
    classSelect.appendChild(option);
  }

  // Обработчики событий
  document.querySelector('.search-button').addEventListener('click', sendSearchRequest);
  document.getElementById('classSelect').addEventListener('change', sendBrowseRequest);
  document.getElementById('niceCheckbox').addEventListener('change', sendBrowseRequest);
  document
    .querySelector('#searchContent .nice-checkbox')
    .addEventListener('change', sendSearchRequest);
});

function sendBrowseRequest() {
  const classCode = document.getElementById('classSelect').value;
  const niceOnly = document.getElementById('niceCheckbox').checked;

  console.log('Sending browse request:', { classCode: classCode, niceOnly: niceOnly });

  fetch(`/browse?class=${classCode}&nice_only=${niceOnly}`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('Received browse data:', data);
      displayResults(data, 'browse');
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('browse-results').innerHTML =
        '<p>An error occurred while fetching results.</p>';
    });
}

function sendSearchRequest() {
  const searchInput = document.querySelector('.search-input').value;
  const niceCheckbox = document.querySelector('#searchContent .nice-checkbox').checked;
  const classCode = document.getElementById('classSelect').value;

  console.log('Sending search request:', {
    query: searchInput,
    classCode: classCode,
    niceOnly: niceCheckbox,
  });

  fetch('/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: searchInput, classCode: classCode, niceOnly: niceCheckbox }),
  })
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then((data) => {
      console.log('Received search data:', data);
      displayResults(data, 'search');
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('search-results').innerHTML =
        '<p>An error occurred while fetching results.</p>';
    });
}

function displayResults(data, type) {
  const resultsContainer = document.getElementById(`${type}-results`);
  const resultCount = document.getElementById(`${type}-result-count`);

  resultsContainer.innerHTML = '';
  resultCount.textContent = data.totalResults;

  if (data.totalResults === 0) {
    resultsContainer.innerHTML = '<p>Нет результатов</p>';
  } else {
    const ul = document.createElement('ul');
    data.results.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <a href="#" class="result-item" data-class="${item.class_code}" data-code="${item.code}">
                    <strong>Класс:</strong> ${item.class_code}
                    <strong>№:</strong> ${item.code}<br>
                    <strong>Имя:</strong> ${item.name_ru}<br>
                </a>
            `;
      li.querySelector('.result-item').addEventListener('click', (e) => {
        e.preventDefault();
        showClassDetail(item.class_code, item.dataset.itemCode);
      });
      ul.appendChild(li);
    });
    resultsContainer.appendChild(ul);
  }

  // Scroll to the bottom of the results container
  resultsContainer.scrollTop = resultsContainer.scrollHeight;
}



function displayResults(data, type) {
  const resultsContainer = document.getElementById(`${type}-results`);
  const resultCount = document.getElementById(`${type}-result-count`);

  resultsContainer.innerHTML = '';
  resultCount.textContent = data.totalResults;

  if (data.totalResults === 0) {
    resultsContainer.innerHTML = '<p>Нет результатов</p>';
  } else {
    const ul = document.createElement('ul');
    data.results.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <a href="#" class="result-item" data-class="${item.class_code}" data-code="${item.code}">
                    <strong>Класс:</strong> ${item.class_code}
                    <strong>№:</strong> ${item.code}<br>
                    <strong>Имя:</strong> ${item.name_ru}<br>
                </a>
            `;
      li.querySelector('.result-item').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.result-item').forEach((item) => {
          item.classList.remove('selected');
        });
        e.target.closest('.result-item').classList.add('selected');
        showClassDetail(item.class_code, item.code);
      });
      ul.appendChild(li);
    });
    resultsContainer.appendChild(ul);
  }
}

function clearClass(classCode) {
  if (confirm(`Вы уверены, что хотите очистить класс ${classCode}?`)) {
    const itemsList = document.querySelector(
      `.class-detail[data-class="${classCode}"] .items-list`,
    );
    if (itemsList) {
      itemsList.innerHTML = '';
      console.log(`Класс ${classCode} очищен`);
    }
  }
}



// Функция для добавления класса
function addClass() {
  const classCode = prompt("Введите номер класса (от 1 до 45):");
  if (classCode && classCode >= 1 && classCode <= 45) {
      showClassDetail(classCode, 'default'); // 'default' - временный код элемента
  } else {
      alert("Некорректный номер класса. Введите число от 1 до 45.");
  }
}

// Функция для редактирования класса
function editClass(classCode) {
  const classContainer = document.querySelector(`.class-detail[data-class="${classCode}"]`);
  if (classContainer) {
      const itemsList = classContainer.querySelector('.items-list');
      const newDescription = prompt("Введите новое описание для класса:");
      if (newDescription) {
          itemsList.innerHTML = `<div class="item-row"><div class="item-name">${newDescription}</div></div>`;
      }
  }
}



function showClassDetail(classCode, itemCode) {
  fetch(`/class/${classCode}`) // Запрос к Flask API
      .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
      })
      .then((data) => {
          const mainContent = document.querySelector('.content-wrapper');

          // Проверяем, есть ли уже блок этого класса
          let classContainer = document.querySelector(`.class-detail[data-class="${classCode}"]`);

          if (!classContainer) {
              // Создаём новый блок для класса
              classContainer = document.createElement('div');
              classContainer.classList.add('class-detail');
              classContainer.setAttribute('data-class', classCode);
              classContainer.innerHTML = `
                  <div class="class-header">
                      <h2>Класс ${classCode}</h2>
                      <div class="class-actions">
                          <button class="action-button" title="Редактировать класс" onclick="editClass('${classCode}')">
                              <img src="/static/images/edit.png" alt="Редактировать">
                              <span>Редактировать класс</span>
                          </button>
                          <button onclick="clearClass('${classCode}')" class="action-button">
                              <img src="/static/images/clear.png" alt="">
                              Очистить класс
                          </button>
                          <button class="action-button" title="Проверить приемлемость" onclick="checkAcceptability('${classCode}')">
                              <img src="/static/images/datebase.png" alt="Проверить">
                              <span>Проверить приемлемость МКТУ</span>
                          </button>
                      </div>
                  </div>
                  <div class="class-description">
                      <h3>Описание для класса ${classCode}</h3>
                      <div class="items-list"></div>
                  </div>
              `;
              mainContent.appendChild(classContainer);
          }

          // Находим контейнер для списка элементов
          const itemsList = classContainer.querySelector('.items-list');

          // Проверяем, есть ли уже этот элемент
          if (itemsList.querySelector(`[data-item="${itemCode}"]`)) {
              console.warn(`Элемент ${itemCode} уже добавлен в класс ${classCode}`);
              return;
          }

          // Ищем выбранный элемент
          const selectedItem = data.items.find((item) => item.code == itemCode);
          if (!selectedItem) {
              console.warn(`Элемент ${itemCode} не найден в классе ${classCode}`);
              return;
          }

          // Создаём HTML для нового элемента
          const newItem = document.createElement('div');
          newItem.classList.add('item-row', selectedItem.exists ? 'exists' : 'not-exists');
          newItem.setAttribute('data-item', itemCode);
          newItem.innerHTML = `
              <div class="item-code">${selectedItem.code}</div>
              <div class="item-name">${selectedItem.name_ru || ''}</div>
          `;

          // Добавляем элемент в его класс
          itemsList.appendChild(newItem);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
}


function checkAcceptability(classCode) {
  console.log(classCode);
  
  const classContainer = document.querySelector(`.class-detail[data-class="${classCode}"]`);
  if (classContainer) {
      const itemsList = classContainer.querySelector('.items-list');
      const terms = itemsList.innerText.split(';').map(term => term.replace(/^\d+\s*–\s*/, '').trim());
      const acceptableTerms = ["аконитин", "алкалоиды", "альгинаты", "альдегиды", "аминокислоты", "анальгетики", "анестетики", "антибиотики", "антисептики", "ацетат алюминия", "ацетаты"]; // Пример допустимых терминов

      const unacceptableTerms = terms.filter(term => {
          // Проверяем, содержится ли хотя бы один допустимый термин в текущем термине
          return !acceptableTerms.some(acceptableTerm => term.includes(acceptableTerm));
      });

      if (unacceptableTerms.length > 0) {
          alert(`Следующие термины недопустимы: ${unacceptableTerms.join(', ')}`);
      } else {
          alert("Все термины допустимы.");
      }
  }
}


function clearClass(classCode) {
  if (confirm(`Вы уверены, что хотите очистить класс ${classCode}?`)) {
    const itemsList = document.querySelector(`.class-detail[data-class="${classCode}"] .items-list`)
    if (itemsList) {
      itemsList.innerHTML = ""
      console.log(`Класс ${classCode} очищен`)
    }
  }
}



function checkTermsInDatabase(textarea) {
  // Implement the logic to check terms in the database
  console.log("Checking terms in database:", textarea.value)
}

// Toolbar functions
function importList() {
  console.log("Import list")
}

function exportList() {
  console.log("Export list")
}

function printPage() {
  window.print()
}

function clearList() {
  if (confirm("Вы уверены, что хотите очистить список?")) {
    console.log("Clear list")
  }
}

function displaySettings() {
  console.log("Display settings")
}

