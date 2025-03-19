// Données globales pour stocker les informations parsed
let tasksData = {};
let softwareData = {};
let formationsData = {};

// Fonction pour parser un fichier Markdown en objet structuré
function parseMarkdownToObject(markdownText, type) {
  const lines = markdownText.split('\n').filter(line => line.trim());
  const result = {};
  let currentKey = null;

  lines.forEach(line => {
    if (line.startsWith('## ')) {
      currentKey = line.replace('## ', '').trim();
      result[currentKey] = type === 'software' ? {} : [];
    } else if (currentKey && line.startsWith('- **') && type === 'software') {
      const [key, value] = line.replace('- **', '').split('**: ').map(s => s.trim());
      result[currentKey][key] = value;
    } else if (currentKey && line.startsWith('- ') && type !== 'software') {
      result[currentKey].push(line.replace('- ', '').trim());
    }
  });
  return result;
}

// Charger les fichiers Markdown
async function loadData() {
  try {
    const [tasksResponse, softwareResponse, formationsResponse] = await Promise.all([
      fetch('./data/tasks.md'),
      fetch('./data/software.md'),
      fetch('./data/formations.md')
    ]);

    if (!tasksResponse.ok || !softwareResponse.ok || !formationsResponse.ok) {
      throw new Error('Erreur lors du chargement des fichiers Markdown');
    }

    const tasksText = await tasksResponse.text();
    const softwareText = await softwareResponse.text();
    const formationsText = await formationsResponse.text();

    tasksData = parseMarkdownToObject(tasksText, 'tasks');
    softwareData = parseMarkdownToObject(softwareText, 'software');
    formationsData = parseMarkdownToObject(formationsText, 'formations');
  } catch (error) {
    console.error('Erreur lors du chargement des données :', error);
    document.getElementById('software-list').innerHTML = '<p>Erreur : impossible de charger les données.</p>';
  }
}

// Générer une vCard HTML
function generateVCard(softwareName) {
  const software = softwareData[softwareName];
  if (!software) {
    return `<div class="vcard"><p>Logiciel "${softwareName}" non trouvé.</p></div>`;
  }

  const licenseClass = software['Type de Licence'].toLowerCase().replace(/\./g, '');
  return `
    <div class="vcard">
      <img src="${software.Logo.split('(')[1].split(')')[0]}" alt="${softwareName} Logo" class="software-logo">
      <h3>${softwareName}</h3>
      <span class="license ${licenseClass}">${software['Type de Licence']}</span>
      <p class="description">${software.Description}</p>
      <p><strong>Site :</strong> <a href="${software['Site Web'].split('(')[1].split(')')[0]}" target="_blank">${software['Site Web'].split(']')[1]}</a></p>
      <code>${software['Commande Linux d\'installation']}</code>
    </div>
  `;
}

// Afficher les logiciels
function displaySoftware(items, containerId) {
  const softwareList = document.getElementById(containerId);
  softwareList.innerHTML = '';

  if (!items || items.length === 0) {
    softwareList.innerHTML = '<p>Aucun logiciel trouvé pour cette sélection.</p>';
    return;
  }

  items.forEach(softwareName => {
    softwareList.innerHTML += generateVCard(softwareName);
  });
}

// Obtenir tous les logiciels disponibles
function getAllSoftware() {
  return Object.keys(softwareData);
}

// Gestion des sélecteurs
function setupSelectors() {
  const taskSelector = document.getElementById('task-selector');
  const formationSelector = document.getElementById('formation-selector');
  const styleButtons = document.querySelectorAll('.style-btn');

  // Remplir les sélecteurs de tâches et formations
  Object.keys(tasksData).forEach(task => {
    const option = document.createElement('option');
    option.value = task;
    option.textContent = task;
    taskSelector.appendChild(option);
  });

  Object.keys(formationsData).forEach(formation => {
    const option = document.createElement('option');
    option.value = formation;
    option.textContent = formation;
    formationSelector.appendChild(option);
  });

  // Afficher tous les logiciels au chargement initial
  displaySoftware(getAllSoftware(), 'software-list');

  // Écouteurs pour les sélecteurs
  taskSelector.addEventListener('change', function () {
    const selectedTask = this.value;
    formationSelector.value = ''; // Réinitialiser l'autre sélecteur
    if (selectedTask === '') {
      // Si aucune tâche n’est sélectionnée, vérifier si une formation est sélectionnée
      const selectedFormation = formationSelector.value;
      if (selectedFormation === '') {
        displaySoftware(getAllSoftware(), 'software-list'); // Afficher tout si rien n’est sélectionné
      } else {
        displaySoftware(formationsData[selectedFormation] || [], 'software-list');
      }
    } else {
      displaySoftware(tasksData[selectedTask] || [], 'software-list');
    }
  });

  formationSelector.addEventListener('change', function () {
    const selectedFormation = this.value;
    taskSelector.value = ''; // Réinitialiser l'autre sélecteur
    if (selectedFormation === '') {
      // Si aucune formation n’est sélectionnée, vérifier si une tâche est sélectionnée
      const selectedTask = taskSelector.value;
      if (selectedTask === '') {
        displaySoftware(getAllSoftware(), 'software-list'); // Afficher tout si rien n’est sélectionné
      } else {
        displaySoftware(tasksData[selectedTask] || [], 'software-list');
      }
    } else {
      displaySoftware(formationsData[selectedFormation] || [], 'software-list');
    }
  });

  // Gestion des boutons de style
  styleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const stylePath = this.getAttribute('data-style');
      document.getElementById('stylesheet').href = stylePath;

      // Supprimer la classe active de tous les boutons
      styleButtons.forEach(btn => btn.classList.remove('active'));
      // Ajouter la classe active au bouton cliqué
      this.classList.add('active');
    });
  });

  // Activer le style par défaut au chargement
  document.querySelector('.style-btn[data-style="styles/styles.css"]').classList.add('active');
}

// Initialisation
async function init() {
  await loadData();
  setupSelectors();
}

init().catch(error => console.error('Erreur d’initialisation :', error));