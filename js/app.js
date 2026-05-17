function loadPage(page) {
  fetch(`views/${page}.html`)
      .then(res => res.text())
      .then(data => {
          document.getElementById("app").innerHTML = data;
      });
}

// default page
window.onload = () => loadPage('home');

// Example state interaction
function selectState(name) {
  alert("You selected: " + name);
}