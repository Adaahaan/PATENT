document.addEventListener("DOMContentLoaded", () => {
    // Обработчики для кнопок верхней панели инструментов
    document.querySelectorAll(".toolbar-button").forEach((button) => {
      button.addEventListener("click", function () {
        const action = this.getAttribute("title")
        switch (action) {
          case "Импортировать перечень":
            handleImport()
            break
          case "Перенести перечень":
            handleTransfer()
            break
          case "Распечатать страницу":
            handlePrint()
            break
          case "Очистить перечень":
            handleClear()
            break
          case "Настройки просмотра":
            handleSettings()
            break
        }
      })
    })
  
    // Обработчики для кнопок действий с классом
    document.querySelectorAll(".action-button").forEach((button) => {
      button.addEventListener("click", function () {
        const action = this.getAttribute("title")
        switch (action) {
          case "Редактировать класс":
            handleEdit()
            break
          case "Очистить класс":
            handleClearClass()
            break
          case "Проверить приемлемость":
            handleCheckCompatibility()
            break
        }
      })
    })
  })
  
  // Функции обработки действий
  function handleImport() {
    console.log("Импорт перечня")
    // Здесь будет логика импорта
  }
  
  function handleTransfer() {
    console.log("Перенос перечня")
    // Здесь будет логика переноса
  }
  
  function handlePrint() {
    window.print()
  }
  
  function handleClear() {
    if (confirm("Вы уверены, что хотите очистить перечень?")) {
      console.log("Очистка перечня")
      // Здесь будет логика очистки
    }
  }
  
  function handleSettings() {
    console.log("Открытие настроек")
    // Здесь будет логика настроек
  }
  
  function handleEdit() {
    console.log("Редактирование класса")
    // Здесь будет логика редактирования
  }
  
  function handleClearClass() {
    if (confirm("Вы уверены, что хотите очистить класс?")) {
      console.log("Очистка класса")
      // Здесь будет логика очистки класса
    }
  }
  
  function handleCheckCompatibility() {
    console.log("Проверка приемлемости")
    // Здесь будет логика проверки
  }
  
  function handleTransfer() {
    console.log("Перенос перечня");
    // Реализуй логику переноса, например, через отправку данных на другой сервер:
    fetch('/transfer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Здесь передаваемые данные для переноса
            data: currentData, // Например, текущий список данных
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Данные успешно перенесены');
        } else {
            alert('Ошибка переноса');
        }
    })
    .catch(error => console.error('Error transferring data:', error));
}

function handleImport() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv, .xlsx';  // Указываем типы файлов для импорта

  fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
          const formData = new FormData();
          formData.append('file', file);

          // Отправляем файл на сервер
          fetch('/import', {
              method: 'POST',
              body: formData,
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Файл успешно импортирован');
                  // Обновляем данные на странице
                  updateList(data.items);
              } else {
                  alert('Ошибка при импорте');
              }
          })
          .catch(error => console.error('Ошибка импорта:', error));
      }
  });

  fileInput.click();  // Открываем диалог выбора файла
}

// document.addEventListener("DOMContentLoaded", () => {

//   document.querySelectorAll(".selectable-item").forEach((item) => {
//     item.addEventListener("click", function() {
//       document.querySelectorAll(".selected")
//     })
//   })
// })

