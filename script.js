// --- 1. БАЗА ДАННЫХ ПРОДУКТОВ (Имитация сервера) ---
const foodDB = [
    { name: "Куриная грудка (вареная)", cal: 165, p: 31, f: 3.6, c: 0 },
    { name: "Гречка (отварная)", cal: 92, p: 3.4, f: 1.2, c: 17 },
    { name: "Рис (отварной)", cal: 130, p: 2.7, f: 0.3, c: 28 },
    { name: "Овсянка", cal: 88, p: 3, f: 1.7, c: 15 },
    { name: "Яйцо куриное (1 шт = 50г)", cal: 155, p: 13, f: 11, c: 1.1 },
    { name: "Творог", cal: 121, p: 12, f: 5, c: 3 },
    { name: "Банан", cal: 89, p: 1.1, f: 0.3, c: 22.8 },
    { name: "Яблоко", cal: 52, p: 0.3, f: 0.2, c: 13.8 },
    { name: "Огурец", cal: 15, p: 0.8, f: 0.1, c: 2.8 },
    { name: "Помидор", cal: 18, p: 0.9, f: 0.2, c: 3.9 },
    { name: "Сыр твердый", cal: 350, p: 26, f: 26, c: 0 },
    { name: "Хлеб цельнозерновой", cal: 250, p: 9, f: 4, c: 43 },
    { name: "Оливковое масло", cal: 898, p: 0, f: 99.8, c: 0 }
];

// Заполняем HTML Datalist (подсказки при поиске)
const dataList = document.getElementById('food-database');
foodDB.forEach(food => {
    let option = document.createElement('option');
    option.value = food.name;
    dataList.appendChild(option);
});

// --- 2. ПАТТЕРН SINGLETON (Менеджер состояний) ---
// Вся информация хранится в одном объекте.
let appState = {
    user: {
        weight: 70, height: 175, age: 25, gender: "male", activity: 1.2, goal: 0
    },
    targets: { cal: 2000, p: 150, f: 66, c: 200 },
    consumed: {
        breakfast: [], lunch: [], dinner: []
    },
    water: 0 // количество выпитых стаканов
};

// --- 3. ИНИЦИАЛИЗАЦИЯ И LOCAL STORAGE ---
function initApp() {
    const savedData = localStorage.getItem('nutriTrackState');
    if (savedData) {
        appState = JSON.parse(savedData);
        fillProfileForm();
    } else {
        calculateNorms(); // Если первый вход - считаем базу
    }
    
    renderWaterTracker();
    updateUI(); // Паттерн Observer: обновляем весь интерфейс на базе state
}

function saveData() {
    localStorage.setItem('nutriTrackState', JSON.stringify(appState));
}

// --- 4. ЛОГИКА РАСЧЕТОВ (Бизнес-логика) ---
// Калькулятор нормы по формуле Миффлина-Сан Жеора
document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    appState.user.gender = document.getElementById('user-gender').value;
    appState.user.age = parseInt(document.getElementById('user-age').value);
    appState.user.weight = parseInt(document.getElementById('user-weight').value);
    appState.user.height = parseInt(document.getElementById('user-height').value);
    appState.user.activity = parseFloat(document.getElementById('user-activity').value);
    appState.user.goal = parseInt(document.getElementById('user-goal').value);

    calculateNorms();
    updateUI();
});

function calculateNorms() {
    const u = appState.user;
    let bmr = (10 * u.weight) + (6.25 * u.height) - (5 * u.age);
    bmr = u.gender === 'male' ? bmr + 5 : bmr - 161;

    let tdee = bmr * u.activity;
    let targetCal = Math.round(tdee + u.goal); // Добавляем или убираем калории для цели

    // Расчет БЖУ: Белки 30%, Жиры 30%, Углеводы 40%
    appState.targets.cal = targetCal;
    appState.targets.p = Math.round((targetCal * 0.30) / 4); // 1г белка = 4 ккал
    appState.targets.f = Math.round((targetCal * 0.30) / 9); // 1г жира = 9 ккал
    appState.targets.c = Math.round((targetCal * 0.40) / 4); // 1г угл = 4 ккал

    saveData();
}

function fillProfileForm() {
    document.getElementById('user-gender').value = appState.user.gender;
    document.getElementById('user-age').value = appState.user.age;
    document.getElementById('user-weight').value = appState.user.weight;
    document.getElementById('user-height').value = appState.user.height;
    document.getElementById('user-activity').value = appState.user.activity;
    document.getElementById('user-goal').value = appState.user.goal;
}

// --- 5. ДОБАВЛЕНИЕ ЕДЫ (Работа с массивами) ---
function addFoodItem(mealType) {
    const nameInput = document.getElementById(`input-${mealType}-name`);
    const weightInput = document.getElementById(`input-${mealType}-weight`);
    
    const foodName = nameInput.value;
    const weight = parseInt(weightInput.value);

    if(!foodName || !weight || weight <= 0) {
        alert("Заполните продукт и вес корректно!"); return;
    }

    // Ищем продукт в базе
    const foodData = foodDB.find(f => f.name.toLowerCase() === foodName.toLowerCase());
    
    let productObj = {};
    if(foodData) {
        // Пересчет на введенный вес
        const ratio = weight / 100;
        productObj = {
            id: Date.now(), // Уникальный ID
            name: foodName,
            weight: weight,
            cal: Math.round(foodData.cal * ratio),
            p: Math.round(foodData.p * ratio * 10)/10,
            f: Math.round(foodData.f * ratio * 10)/10,
            c: Math.round(foodData.c * ratio * 10)/10
        };
    } else {
        // Если продукта нет в базе, добавляем примерный (упрощение)
        const approxCal = weight * 1.5; // в среднем 150 ккал на 100г
        productObj = {
            id: Date.now(), name: foodName, weight: weight, cal: Math.round(approxCal), p: 0, f: 0, c: 0
        };
    }

    appState.consumed[mealType].push(productObj);
    
    nameInput.value = '';
    weightInput.value = '';
    
    updateUI();
}

function deleteFoodItem(mealType, id) {
    appState.consumed[mealType] = appState.consumed[mealType].filter(item => item.id !== id);
    updateUI();
}

// --- 6. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА (View Updater) ---
function updateUI() {
    renderFoodLists();
    updateDashboard();
    saveData();
}

function renderFoodLists() {
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        const ul = document.getElementById(`list-${meal}`);
        ul.innerHTML = '';
        
        let mealCalTotal = 0;

        appState.consumed[meal].forEach(item => {
            mealCalTotal += item.cal;
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span><b>${item.name}</b> (${item.weight}г)</span>
                <span>${item.cal} ккал <button class="delete-btn" onclick="deleteFoodItem('${meal}', ${item.id})">×</button></span>
            `;
            ul.appendChild(li);
        });

        document.getElementById(`${meal}-cals`).textContent = `${mealCalTotal} ккал`;
    });
}

function updateDashboard() {
    let currentCals = 0, currentP = 0, currentF = 0, currentC = 0;

    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        appState.consumed[meal].forEach(item => {
            currentCals += item.cal;
            currentP += item.p;
            currentF += item.f;
            currentC += item.c;
        });
    });

    const targetCals = appState.targets.cal;
    let leftCals = targetCals - currentCals;

    // Обновляем текст
    document.getElementById('header-kcal-left').textContent = leftCals > 0 ? leftCals : 0;
    document.getElementById('kcal-consumed').textContent = currentCals;
    document.getElementById('kcal-target').textContent = targetCals;

    // Обновляем Круговую диаграмму (CSS Conic Gradient)
    const percentage = Math.min((currentCals / targetCals) * 100, 100);
    const circle = document.querySelector('.circle-chart');
    const color = percentage >= 100 ? 'var(--color-danger)' : 'var(--color-primary)';
    circle.style.background = `conic-gradient(${color} ${percentage}%, #e5e7eb ${percentage}%)`;

    // Обновляем прогресс-бары БЖУ
    updateMacroBar('protein', currentP, appState.targets.p);
    updateMacroBar('fat', currentF, appState.targets.f);
    updateMacroBar('carbs', currentC, appState.targets.c);
}

function updateMacroBar(idPrefix, current, target) {
    document.getElementById(`${idPrefix}-text`).textContent = `${Math.round(current)} / ${target} г`;
    let percent = Math.min((current / target) * 100, 100);
    document.getElementById(`${idPrefix}-bar`).style.width = `${percent}%`;
}

// --- 7. ТРЕКЕР ВОДЫ (Механика состояний) ---
function renderWaterTracker() {
    const container = document.getElementById('water-glasses-container');
    container.innerHTML = '';
    
    for(let i = 0; i < 8; i++) {
        let glass = document.createElement('div');
        glass.className = 'glass' + (i < appState.water ? ' filled' : '');
        glass.onclick = () => toggleWater(i);
        container.appendChild(glass);
    }
}

function toggleWater(index) {
    // Если кликаем на уже заполненный - убавляем, иначе прибавляем
    if (appState.water === index + 1) {
        appState.water--;
    } else {
        appState.water = index + 1;
    }
    renderWaterTracker();
    saveData();
}

// Сброс данных нового дня
function resetData() {
    if(confirm("Вы уверены, что хотите очистить весь съеденный рацион за сегодня?")) {
        appState.consumed = { breakfast: [], lunch: [], dinner: [] };
        appState.water = 0;
        updateUI();
        renderWaterTracker();
    }
}

// ЗАПУСК!
initApp();