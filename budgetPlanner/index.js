const form = document.getElementById('form');
const name = document.getElementById('name');
const cost = document.getElementById('cost');
const error = document.getElementById('error');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (name.value && cost.value) {
    error.textContent = '';
    const item = {
      name: name.value,
      cost: parseInt(cost.value, 10),
    };
    
    db
      .collection('expenses')
      .add(item)
      .then(() => {
        name.value = '';
        cost.value = '';
      });

  } else {
    error.textContent = 'Please enter all values before submitting';
    setTimeout(() => {
      error.textContent = '';
    }, 4000)
  }
});
