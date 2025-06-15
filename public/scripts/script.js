// I swear this was not intentional
const [l, d, s] = ['light', 'dark', 'system'];
const dm = JSON.parse(localStorage.getItem('dm')) || { value: s };
const themeSelect = document.getElementById('theme-select');

// now this, this is beutiful
const updateTheme = e => (
    (e ? e.target === themeSelect && dm.value !== themeSelect.value ? dm.value = themeSelect.value : (dm.value = dm.value === s ? window.matchMedia('(prefers-color-scheme: dark)').matches ? l : d : dm.value === l ? d : l, themeSelect.value = dm.value) : void 0), 
    [l, d].forEach(state => document.documentElement.classList.toggle(state, state === dm.value)), 
    localStorage.setItem('dm', JSON.stringify(dm))
);

document.getElementById('theme-btn').addEventListener('click', updateTheme);

themeSelect.addEventListener('input', updateTheme);

updateTheme();
