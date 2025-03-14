document.addEventListener("DOMContentLoaded", () => {
    const domainSelect = document.getElementById("domain");
    const activitySelect = document.getElementById("activity");
    const softwareList = document.getElementById("software-list");

    // Fetch and parse the Markdown file
    fetch("software-list.md")
        .then(response => response.text())
        .then(data => {
            const softwareData = parseMarkdown(data);
            populateSelectors(softwareData);
            displaySoftware(softwareData);

            // Filter on change
            domainSelect.addEventListener("change", () => filterSoftware(softwareData));
            activitySelect.addEventListener("change", () => filterSoftware(softwareData));
        });

    // Parse Markdown into a structured object
    function parseMarkdown(markdown) {
        const lines = markdown.split("\n").filter(line => line.trim());
        const softwareData = {};
        let currentDomain = "";

        lines.forEach(line => {
            if (line.startsWith("## Domain: ")) {
                currentDomain = line.replace("## Domain: ", "").trim();
                softwareData[currentDomain] = [];
            } else if (line.startsWith("### ")) {
                const name = line.replace("### ", "").trim();
                softwareData[currentDomain].push({ name, attributes: {} });
            } else if (line.startsWith("- ")) {
                const [key, value] = line.replace("- ", "").split(": ").map(s => s.trim());
                const lastSoftware = softwareData[currentDomain][softwareData[currentDomain].length - 1];
                lastSoftware.attributes[key] = value;
            }
        });
        return softwareData;
    }

    // Populate dropdowns with unique domains and activities
    function populateSelectors(data) {
        const domains = Object.keys(data);
        domains.forEach(domain => {
            const option = document.createElement("option");
            option.value = domain;
            option.textContent = domain;
            domainSelect.appendChild(option);
        });

        const activities = new Set();
        for (const domain in data) {
            data[domain].forEach(software => activities.add(software.attributes.Activity));
        }
        activities.forEach(activity => {
            const option = document.createElement("option");
            option.value = activity;
            option.textContent = activity;
            activitySelect.appendChild(option);
        });
    }

    // Display software cards
    function displaySoftware(data, domainFilter = "all", activityFilter = "all") {
        softwareList.innerHTML = "";
        for (const domain in data) {
            if (domainFilter !== "all" && domain !== domainFilter) continue;
            data[domain].forEach(software => {
                const { Activity, Description, Link, Logo, LinuxCommand } = software.attributes;
                if (activityFilter !== "all" && Activity !== activityFilter) return;

                const card = document.createElement("div");
                card.className = "software-card";
                card.innerHTML = `
                    <img src="${Logo}" alt="${software.name} Logo">
                    <h3>${software.name}</h3>
                    <p>${Description}</p>
                    <p><a href="${Link}" target="_blank">Link</a></p>
                    <div class="command">${LinuxCommand}</div>
                `;
                softwareList.appendChild(card);
            });
        }
    }

    // Filter software based on selections
    function filterSoftware(data) {
        const domain = domainSelect.value;
        const activity = activitySelect.value;
        displaySoftware(data, domain, activity);
    }
});