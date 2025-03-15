document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('software-filter');
    const softwareGrid = document.getElementById('software-grid');
    const domainSelect = document.getElementById('domain');
    const taskSelect = document.getElementById('task');
    const commercialCheckbox = document.getElementById('commercial');

    let softwareData = [];

    // Load software data
    fetch('./data/software.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load software.json');
            return response.json();
        })
        .then(data => {
            softwareData = data.software || [];
            const domains = data.domains || [];
            const tasks = data.tasks || [];

            // Populate dropdowns
            populateDropdown(domainSelect, domains);
            populateDropdown(taskSelect, tasks);

            // Display all software initially
            displaySoftware(softwareData);

            // Filter on change with reset logic
            domainSelect.addEventListener('change', () => {
                taskSelect.value = ''; // Reset Task selection
                filterSoftware();
            });
            taskSelect.addEventListener('change', () => {
                domainSelect.value = ''; // Reset Work Domain selection
                filterSoftware();
            });
            commercialCheckbox.addEventListener('change', filterSoftware);
        })
        .catch(error => {
            console.error('Error loading software:', error);
            softwareGrid.innerHTML = '<p>Failed to load software options. Please try again later.</p>';
        });

    function populateDropdown(selectElement, options) {
        selectElement.innerHTML = '<option value="">All ' + selectElement.id.charAt(0).toUpperCase() + selectElement.id.slice(1) + 's</option>' +
            options.map(option => `<option value="${option}">${option}</option>`).join('');
    }

    function filterSoftware() {
        const filters = {
            domain: domainSelect.value,
            task: taskSelect.value,
            commercial: commercialCheckbox.checked
        };
        displaySoftware(softwareData, filters);
    }

    function displaySoftware(software, filters = {}) {
        softwareGrid.innerHTML = '';

        const filteredSoftware = software.filter(item => {
            const domainMatch = !filters.domain || (item.domains && item.domains.includes(filters.domain));
            const taskMatch = !filters.task || (item.tasks && item.tasks.includes(filters.task));
            const commercialMatch = !filters.commercial || item.commercialUse;
            return domainMatch && taskMatch && commercialMatch;
        });

        if (filteredSoftware.length === 0) {
            softwareGrid.innerHTML = '<p>No software matches your criteria.</p>';
            return;
        }

        filteredSoftware.forEach(item => {
            const licenseClass = item.license.toLowerCase().replace(/\./g, '-');
            const card = document.createElement('div');
            card.className = 'software-card';
            card.innerHTML = `
                <img src="${item.logo || './assets/placeholder.png'}" alt="${item.name} Logo">
                <h3>${item.name}</h3>
                <span class="license ${licenseClass}">${item.license}</span>
                <p class="description">${item.description}</p>
                <p><a href="${item.link}" target="_blank">Website</a></p>
                <div class="install">${item.install}</div>
            `;
            softwareGrid.appendChild(card);

            const img = card.querySelector('img');
            img.onerror = () => img.src = './assets/placeholder.png';
        });
    }
});