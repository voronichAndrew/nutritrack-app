// --- 1. РАСШИРЕННАЯ БАЗА ПРОДУКТОВ ---
const foodDB = [
    { name: "Куриная грудка (отварная)", cal: 165, p: 31, f: 3.6, c: 0 },
    { name: "Куриное бедро (запеченное)", cal: 209, p: 26, f: 11, c: 0 },
    { name: "Говядина (постная)", cal: 250, p: 26, f: 15, c: 0 },
    { name: "Свинина (вырезка)", cal: 290, p: 25, f: 20, c: 0 },
    { name: "Лосось (гриль)", cal: 206, p: 22, f: 13, c: 0 },
    { name: "Минтай (отварной)", cal: 72, p: 16, f: 1, c: 0 },
    { name: "Яйцо куриное (варёное)", cal: 155, p: 13, f: 11, c: 1.1 },
    { name: "Творог 5%", cal: 121, p: 12, f: 5, c: 3 },
    { name: "Сыр твердый (Российский)", cal: 350, p: 26, f: 26, c: 0 },
    { name: "Молоко 2.5%", cal: 52, p: 2.8, f: 2.5, c: 4.7 },
    { name: "Гречка (отварная)", cal: 92, p: 3.4, f: 1.2, c: 17 },
    { name: "Рис белый (отварной)", cal: 130, p: 2.7, f: 0.3, c: 28 },
    { name: "Макароны (из твердых сортов)", cal: 112, p: 3.6, f: 0.6, c: 23 },
    { name: "Картофельное пюре", cal: 88, p: 2, f: 3, c: 13 },
    { name: "Овсянка на воде", cal: 88, p: 3, f: 1.7, c: 15 },
    { name: "Огурец свежий", cal: 15, p: 0.8, f: 0.1, c: 2.8 },
    { name: "Помидор свежий", cal: 18, p: 0.9, f: 0.2, c: 3.9 },
    { name: "Брокколи (отварная)", cal: 34, p: 2.8, f: 0.4, c: 7 },
    { name: "Банан", cal: 89, p: 1.1, f: 0.3, c: 22.8 },
    { name: "Яблоко", cal: 52, p: 0.3, f: 0.2, c: 13.8 },
    { name: "Авокадо", cal: 160, p: 2, f: 15, c: 9 },
    { name: "Хлеб цельнозерновой", cal: 250, p: 9, f: 4, c: 43 },
    { name: "Оливковое масло", cal: 898, p: 0, f: 99.8, c: 0 },
    { name: "Орехи грецкие", cal: 654, p: 15, f: 65, c: 14 },
    { name: "Шоколад горький 70%", cal: 546, p: 5, f: 31, c: 61 }
];

// --- 2. МЕНЕДЖЕР СОСТОЯНИЯ (Singleton) ---
let appState = {
    isProfileFilled: false,
    user: { name: "", weight: "", height: "", age: "", gender: "", activity: "", goal: "" },
    targets: { cal: 0, p: 0, f: 0, c: 0 },
    consumed: { breakfast: [], lunch: [], dinner: [] },
    water: 0
};

// --- 3. ИНИЦИАЛИЗАЦИЯ И МАРШРУТИЗАЦИЯ ---
function initApp() {
    const savedData = localStorage.getItem('nutriTrackProState');
    if (savedData) {
        appState = JSON.parse(savedData);
    }
    
    // Если профиль не заполнен, принудительно открываем "Профиль"
    if (!appState.isProfileFilled) {
        document.getElementById('profile-warning').classList.remove('hidden');
        switchPage('profile', document.querySelectorAll('.nav-btn')[2]);
    } else {
        document.getElementById('profile-warning').classList.add('hidden');
        fillProfileForm();
        calculateBMI();
    }
    
    renderWaterTracker();
    updateUI();
}

function saveData() {
    localStorage.setItem('nutriTrackProState', JSON.stringify(appState));
}

// Навигация (SPA)
function switchPage(pageId, btnElement) {
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
}

// --- 4. ЖИВОЙ ПОИСК (Live Search) ---
function handleSearch(mealType) {
    const input = document.getElementById(`search-${mealType}`);
    const resultsContainer = document.getElementById(`results-${mealType}`);
    const query = input.value.toLowerCase().trim();

    resultsContainer.innerHTML = '';

    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }

    // Ищем совпадения в базе
    const matches = foodDB.filter(food => food.name.toLowerCase().includes(query));

    if (matches.length > 0) {
        resultsContainer.classList.remove('hidden');
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<span>${match.name}</span> <small>${match.cal} ккал</small>`;
            // По клику вставляем имя в инпут и скрываем подсказки
            div.onclick = () => {
                input.value = match.name;
                resultsContainer.classList.add('hidden');
            };
            resultsContainer.appendChild(div);
        });
    } else {
        resultsContainer.classList.add('hidden');
    }
}

// Скрываем подсказки при клике вне
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        document.querySelectorAll('.search-results').forEach(el => el.classList.add('hidden'));
    }
});

// --- 5. ВАЛИДАЦИЯ И ПРОФИЛЬ ---
document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    // Сбор данных
    appState.user.name = document.getElementById('user-name').value.trim();
    appState.user.gender = document.getElementById('user-gender').value;
    appState.user.age = parseInt(document.getElementById('user-age').value);
    appState.user.weight = parseFloat(document.getElementById('user-weight').value);
    appState.user.height = parseInt(document.getElementById('user-height').value);
    appState.user.activity = parseFloat(document.getElementById('user-activity').value);
    appState.user.goal = parseInt(document.getElementById('user-goal').value);

    // Валидация пройдена (HTML5 required тоже работает)
    appState.isProfileFilled = true;
    
    calculateNorms();
    calculateBMI();
    updateUI();

    document.getElementById('profile-warning').classList.add('hidden');
    
    const alertBox = document.getElementById('save-alert');
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 3000);
});

function calculateNorms() {
    const u = appState.user;
    if(!appState.isProfileFilled) return;

    let bmr = (10 * u.weight) + (6.25 * u.height) - (5 * u.age);
    bmr = u.gender === 'male' ? bmr + 5 : bmr - 161;

    let tdee = bmr * u.activity;
    let targetCal = Math.round(tdee + u.goal); 

    appState.targets.cal = targetCal > 1000 ? targetCal : 1200; // Минимум 1200 для здоровья
    appState.targets.p = Math.round((appState.targets.cal * 0.30) / 4);
    appState.targets.f = Math.round((appState.targets.cal * 0.30) / 9);
    appState.targets.c = Math.round((appState.targets.cal * 0.40) / 4);

    saveData();
}

function calculateBMI() {
    if(!appState.isProfileFilled) return;
    const w = appState.user.weight;
    const h = appState.user.height / 100; 
    const bmi = (w / (h * h)).toFixed(1);
    
    let status = "", color = "";
    if(bmi < 18.5) { status = "Дефицит веса"; color = "#f59e0b"; }
    else if(bmi < 24.9) { status = "Норма"; color = "#10b981"; }
    else if(bmi < 29.9) { status = "Избыточный вес"; color = "#f59e0b"; }
    else { status = "Ожирение"; color = "#ef4444"; }

    const badge = document.getElementById('bmi-display');
    badge.innerHTML = `ИМТ: ${bmi} <span>(${status})</span>`;
    badge.style.color = color;
}

function fillProfileForm() {
    if(!appState.isProfileFilled) return;
    document.getElementById('user-name').value = appState.user.name;
    document.getElementById('user-gender').value = appState.user.gender;
    document.getElementById('user-age').value = appState.user.age;
    document.getElementById('user-weight').value = appState.user.weight;
    document.getElementById('user-height').value = appState.user.height;
    document.getElementById('user-activity').value = appState.user.activity;
    document.getElementById('user-goal').value = appState.user.goal;
}

// --- 6. ДОБАВЛЕНИЕ ЕДЫ В ЖУРНАЛ ---
function addFoodItem(mealType) {
    if (!appState.isProfileFilled) {
        alert("Сначала заполните профиль, чтобы мы знали вашу норму!");
        return;
    }

    const nameInput = document.getElementById(`search-${mealType}`);
    const weightInput = document.getElementById(`weight-${mealType}`);
    
    const foodName = nameInput.value.trim();
    const weight = parseInt(weightInput.value);

    if(!foodName || !weight || weight <= 0) {
        alert("Заполните название и корректный вес (больше 0)!"); 
        return;
    }

    const foodData = foodDB.find(f => f.name.toLowerCase() === foodName.toLowerCase());
    let productObj = {};

    if(foodData) {
        const ratio = weight / 100;
        productObj = {
            id: Date.now(),
            name: foodName,
            weight: weight,
            cal: Math.round(foodData.cal * ratio),
            p: Math.round(foodData.p * ratio * 10)/10,
            f: Math.round(foodData.f * ratio * 10)/10,
            c: Math.round(foodData.c * ratio * 10)/10
        };
    } else {
        // Продукт вне базы
        const approxCal = weight * 1.5; 
        productObj = {
            id: Date.now(), name: foodName + " (Оценка)", weight: weight, cal: Math.round(approxCal), p: 0, f: 0, c: 0
        };
    }

    appState.consumed[mealType].push(productObj);
    nameInput.value = ''; weightInput.value = '';
    
    updateUI();
}

function deleteFoodItem(mealType, id) {
    appState.consumed[mealType] = appState.consumed[mealType].filter(item => item.id !== id);
    updateUI();
}

// --- 7. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ---
function updateUI() {
    // Приветствие
    const welcome = document.getElementById('welcome-message');
    if(appState.isProfileFilled) {
        welcome.textContent = `Привет, ${appState.user.name}! Вот твоя сводка на сегодня:`;
    }

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
                <span><b>${item.name}</b> <small>(${item.weight}г)</small></span>
                <span>${item.cal} ккал <button class="delete-btn" title="Удалить" onclick="deleteFoodItem('${meal}', ${item.id})">×</button></span>
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

    // Обновляем текст на дашборде
    document.getElementById('header-kcal-left').textContent = appState.isProfileFilled ? (leftCals > 0 ? leftCals : 0) : '---';
    document.getElementById('kcal-consumed').textContent = currentCals;
    document.getElementById('kcal-target').textContent = appState.isProfileFilled ? targetCals : '---';

    // Круг
    let percentage = 0;
    if(targetCals > 0) percentage = Math.min((currentCals / targetCals) * 100, 100);
    
    const circle = document.querySelector('.circle-chart');
    const color = percentage >= 100 ? 'var(--color-danger)' : 'var(--color-primary)';
    circle.style.background = `conic-gradient(${color} ${percentage}%, #e2e8f0 ${percentage}%)`;

    // Бары
    updateMacroBar('protein', currentP, appState.targets.p);
    updateMacroBar('fat', currentF, appState.targets.f);
    updateMacroBar('carbs', currentC, appState.targets.c);
}

function updateMacroBar(idPrefix, current, target) {
    if(!appState.isProfileFilled || target === 0) {
        document.getElementById(`${idPrefix}-text`).textContent = `0 / 0 г`;
        document.getElementById(`${idPrefix}-bar`).style.width = `0%`;
        return;
    }
    document.getElementById(`${idPrefix}-text`).textContent = `${Math.round(current)} / ${target} г`;
    let percent = Math.min((current / target) * 100, 100);
    document.getElementById(`${idPrefix}-bar`).style.width = `${percent}%`;
}

// --- 8. ТРЕКЕР ВОДЫ ---
function renderWaterTracker() {
    const container = document.getElementById('water-glasses-container');
    container.innerHTML = '';
    for(let i = 0; i < 8; i++) {
        let glass = document.createElement('div');
        glass.className = 'glass' + (i < appState.water ? ' filled' : '');
        glass.onclick = () => {
            if (appState.water === i + 1) appState.water--;
            else appState.water = i + 1;
            renderWaterTracker();
            saveData();
        };
        container.appendChild(glass);
    }
}

function resetData() {
    if(confirm("Начать новый день? Вся съеденная еда будет удалена (Профиль сохранится).")) {
        appState.consumed = { breakfast: [], lunch: [], dinner: [] };
        appState.water = 0;
        updateUI();
        renderWaterTracker();
    }
}

// СТАРТ
initApp();
