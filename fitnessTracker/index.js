const btns = document.querySelectorAll('button')
const form = document.querySelector('form');
const formAct = document.querySelector('form span');
const input = document.querySelector('input');
const error = document.querySelector('.error');

let activity = 'cycling';

const handleBtnClick = (e) => {
  activity = e.target.dataset.activity;

  btns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  formAct.textContent = activity;
  input.setAttribute('id', activity);

  updateChart(data);

};

btns.forEach(btn => btn.addEventListener('click', handleBtnClick));

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const distance = parseInt(input.value, 10);
  if (distance) {
    db
      .collection('activities')
      .add({
        distance,
        activity,
        date: new Date().toString(),
      })
      .then(() => {
        error.textContent = '';
        input.value = '';
      })
  } else {
    error.textContent = 'Please enter a valid distance';
    setTimeout(() => {
      error.textContent = '';
    }, 4000);
  }
});
