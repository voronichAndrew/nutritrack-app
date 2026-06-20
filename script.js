const foodDB = [
    // Мясо и Птица
    { name: "Куриная грудка (вареная)", cal: 165, p: 31, f: 3.6, c: 0 },
    { name: "Говядина (постная)", cal: 250, p: 26, f: 15, c: 0 },
    { name: "Свинина (вареная)", cal: 290, p: 25, f: 20, c: 0 },
    { name: "Индейка (филе)", cal: 130, p: 24, f: 3, c: 0 },
    // Рыба
    { name: "Лосось (запеченный)", cal: 206, p: 22, f: 13, c: 0 },
    { name: "Минтай", cal: 72, p: 16, f: 1, c: 0 },
    { name: "Тунец", cal: 130, p: 29, f: 1, c: 0 },
    // Гарниры
    { name: "Гречка (отварная)", cal: 92, p: 3.4, f: 1.2, c: 17 },
    { name: "Рис белый (отварной)", cal: 130, p: 2.7, f: 0.3, c: 28 },
    { name: "Макароны (отварные)", cal: 112, p: 3.6, f: 0.6, c: 23 },
    { name: "Картофельное пюре", cal: 88, p: 2, f: 3, c: 13 },
    { name: "Овсянка на воде", cal: 88, p: 3, f: 1.7, c: 15 },
    // Овощи
    { name: "Огурец", cal: 15, p: 0.8, f: 0.1, c: 2.8 },
    { name: "Помидор", cal: 18, p: 0.9, f: 0.2, c: 3.9 },
    { name: "Капуста белокочанная", cal: 25, p: 1.3, f: 0.1, c: 5.8 },
    { name: "Брокколи", cal: 34, p: 2.8, f: 0.4, c: 7 },
    { name: "Морковь", cal: 41, p: 0.9, f: 0.2, c: 10 },
    // Фрукты и Ягоды
    { name: "Банан", cal: 89, p: 1.1, f: 0.3, c: 22.8 },
    { name: "Яблоко", cal: 52, p: 0.3, f: 0.2, c: 13.8 },
    { name: "Апельсин", cal: 47, p: 0.9, f: 0.1, c: 11.8 },
    { name: "Клубника", cal: 32, p: 0.7, f: 0.3, c: 7.7 },
    // Молочные продукты и Яйца
    { name: "Яйцо куриное (1 шт = 50г)", cal: 155, p: 13, f: 11, c: 1.1 },
    { name: "Творог 5%", cal: 121, p: 12, f: 5, c: 3 },
    { name: "Молоко 2.5%", cal: 52, p: 2.8, f: 2.5, c: 4.7 },
    { name: "Кефир 2%", cal: 50, p: 3.4, f: 2, c: 4.7 },
    { name: "Сыр твердый (Российский)", cal: 350, p: 26, f: 26, c: 0 },
    { name: "Йогурт натуральный", cal: 59, p: 10, f: 0.4, c: 3.6 },
    // Хлеб и выпечка
    { name: "Хлеб цельнозерновой", cal: 250, p: 9, f: 4, c: 43 },
    { name: "Хлеб белый", cal: 265, p: 9, f: 3, c: 49 },
    { name: "Лаваш", cal: 275, p: 9, f: 1.2, c: 56 },
    // Разное
    { name: "Оливковое масло", cal: 898, p: 0, f: 99.8, c: 0 },
    { name: "Орехи грецкие", cal: 654, p: 15, f: 65, c: 14 },
    { name: "Шоколад горький", cal: 546, p: 5, f: 31, c: 61 },
    { name: "Сахар", cal: 387, p: 0, f: 0, c: 100 },
    { name: "Кофе (без сахара)", cal: 2, p: 0.2, f: 0, c: 0 }
];

const dataList = document.getElementById('food-database');
foodDB.forEach(food => {
    let option = document.createElement('option');
    option.value = food.name;
    dataList.appendChild(option);
});

let appState = {
    user: { weight: 70, height: 175, age: 25, gender: "male", activity: 1.2, goal: 0 },
    targets: { cal: 2000, p: 150, f: 66, c: 200 },
    consumed: { breakfast: [], lunch: [], dinner: [] },
    water: 0
};

function initApp() {
    const savedData = localStorage.getItem('nutriTrackPro');
    if (savedData) {
        appState = JSON.parse(savedData);
    } else {
        calculateNorms(); 
    }
    
    fillProfileForm();
    calculateBMI();
    renderWaterTracker();
    updateUI();
}

function saveData() {
    localStorage.setItem('nutriTrackPro', JSON.stringify(appState));
}


function switchPage(pageId, btnElement) {
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
}

document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    appState.user.gender = document.getElementById('user-gender').value;
    appState.user.age = parseInt(document.getElementById('user-age').value);
    appState.user.weight = parseFloat(document.getElementById('user-weight').value);
    appState.user.height = parseInt(document.getElementById('user-height').value);
    appState.user.activity = parseFloat(document.getElementById('user-activity').value);
    appState.user.goal = parseInt(document.getElementById('user-goal').value);

    calculateNorms();
    calculateBMI();
    updateUI();

    const alertBox = document.getElementById('save-alert');
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 3000);
});

function calculateNorms() {
    const u = appState.user;
    let bmr = (10 * u.weight) + (6.25 * u.height) - (5 * u.age);
    bmr = u.gender === 'male' ? bmr + 5 : bmr - 161;

    let tdee = bmr * u.activity;
    let targetCal = Math.round(tdee + u.goal); 

    appState.targets.cal = targetCal;
    appState.targets.p = Math.round((targetCal * 0.30) / 4);
    appState.targets.f = Math.round((targetCal * 0.30) / 9);
    appState.targets.c = Math.round((targetCal * 0.40) / 4);

    saveData();
}

function calculateBMI() {
    const w = appState.user.weight;
    const h = appState.user.height / 100; 
    const bmi = (w / (h * h)).toFixed(1);
    
    let status = "";
    if(bmi < 18.5) status = "Дефицит массы";
    else if(bmi < 24.9) status = "Норма";
    else if(bmi < 29.9) status = "Избыточный вес";
    else status = "Ожирение";

    document.getElementById('bmi-display').textContent = `ИМТ: ${bmi} (${status})`;
}

function fillProfileForm() {
    document.getElementById('user-gender').value = appState.user.gender;
    document.getElementById('user-age').value = appState.user.age;
    document.getElementById('user-weight').value = appState.user.weight;
    document.getElementById('user-height').value = appState.user.height;
    document.getElementById('user-activity').value = appState.user.activity;
    document.getElementById('user-goal').value = appState.user.goal;
}

function addFoodItem(mealType) {
    const nameInput = document.getElementById(`input-${mealType}-name`);
    const weightInput = document.getElementById(`input-${mealType}-weight`);
    
    const foodName = nameInput.value.trim();
    const weight = parseInt(weightInput.value);

    if(!foodName || !weight || weight <= 0) {
        alert("Заполните название продукта и укажите вес больше 0!"); 
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
        const approxCal = weight * 1.5; 
        productObj = {
            id: Date.now(), name: foodName + " (Своё)", weight: weight, cal: Math.round(approxCal), p: 0, f: 0, c: 0
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
                <span><b>${item.name}</b> <small>(${item.weight}г)</small></span>
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

    document.getElementById('header-kcal-left').textContent = leftCals > 0 ? leftCals : 0;
    document.getElementById('kcal-consumed').textContent = currentCals;
    document.getElementById('kcal-target').textContent = targetCals;

    const percentage = Math.min((currentCals / targetCals) * 100, 100);
    const circle = document.querySelector('.circle-chart');
    const color = percentage >= 100 ? 'var(--color-danger)' : 'var(--color-primary)';
    circle.style.background = `conic-gradient(${color} ${percentage}%, #e5e7eb ${percentage}%)`;

    updateMacroBar('protein', currentP, appState.targets.p);
    updateMacroBar('fat', currentF, appState.targets.f);
    updateMacroBar('carbs', currentC, appState.targets.c);
}

function updateMacroBar(idPrefix, current, target) {
    document.getElementById(`${idPrefix}-text`).textContent = `${Math.round(current)}/${target}г`;
    let percent = Math.min((current / target) * 100, 100);
    document.getElementById(`${idPrefix}-bar`).style.width = `${percent}%`;
}

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
    if (appState.water === index + 1) appState.water--;
    else appState.water = index + 1;
    renderWaterTracker();
    saveData();
}

function resetData() {
    if(confirm("Очистить все данные за сегодня? (Профиль сохранится)")) {
        appState.consumed = { breakfast: [], lunch: [], dinner: [] };
        appState.water = 0;
        updateUI();
        renderWaterTracker();
    }
}

initApp();
