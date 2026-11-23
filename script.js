
const STORAGE_KEY = "craftifyOfferings";

const defaultOfferings = [
    {
        id: "default-1",
        name: "Creative Crafts Workshop",
        description: "Learn different creative crafting techniques in a fun and friendly environment.",
        category: "Crafts",
        price: 80,
        image: "images/craft.png"
    },
    {
        id: "default-2",
        name: "Painting Lab",
        description: "Learn painting techniques, colours, and creative expression.",
        category: "Painting",
        price: 120,
        image: "images/painting.png"
    },
    {
        id: "default-3",
        name: "Pottery Studio",
        description: "Learn pottery techniques and create your own ceramic pieces.",
        category: "Pottery",
        price: 150,
        image: "images/pottery.png"
    }
];

function getOfferings() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOfferings));
        return [...defaultOfferings];
    }

    try {
        const offerings = JSON.parse(saved);
        return Array.isArray(offerings) ? offerings : [...defaultOfferings];
    } catch (error) {
        console.error("Could not read saved offerings:", error);
        return [...defaultOfferings];
    }
}

function saveOfferings(offerings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offerings));
}


/* ---------- Club Offerings page ---------- */

function initializeOfferingsPage() {

    const list = document.querySelector(".offerings-list");
    const sortName = document.querySelector("#sort-name");
    const sortPrice = document.querySelector("#sort-price");

    if (!list || !sortName || !sortPrice) return;

    let offerings = getOfferings();

    function renderOfferings(items) {

        list.querySelectorAll(".offering").forEach(function(card) {
            card.remove();
        });

        items.forEach(function(item) {

            const card = document.createElement("article");
            card.className = "offering";

            const image = document.createElement("img");
            image.src = item.image;
            image.alt = item.name;

            image.onerror = function() {
                image.style.display = "none";
            };

            const info = document.createElement("div");
            info.className = "offering-info";

            const heading = document.createElement("h2");
            heading.textContent = item.name;

            const description = document.createElement("p");
            description.textContent = item.description;

            const category = document.createElement("span");
            category.className = "category";
            category.textContent = item.category || "New Offering";

            const price = document.createElement("span");
            price.className = "price";
            price.textContent = "Price: SAR " + Number(item.price).toFixed(0);

            info.append(heading, description, category, price);

            card.append(image, info);

            list.appendChild(card);
        });
    }

    function sortAndRender() {

        const sorted = [...offerings];

        if (sortName.value === "name-a-z") {

            sorted.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });

        } else if (sortName.value === "name-z-a") {

            sorted.sort(function(a, b) {
                return b.name.localeCompare(a.name);
            });

        } else if (sortPrice.value === "price-low-high") {

            sorted.sort(function(a, b) {
                return Number(a.price) - Number(b.price);
            });

        } else if (sortPrice.value === "price-high-low") {

            sorted.sort(function(a, b) {
                return Number(b.price) - Number(a.price);
            });

        } else {

            for (let i = sorted.length - 1; i > 0; i--) {

                const j = Math.floor(Math.random() * (i + 1));

                const temp = sorted[i];
                sorted[i] = sorted[j];
                sorted[j] = temp;
            }
        }

        renderOfferings(sorted);
    }

    sortName.value = "name";
    sortPrice.value = "price";

    sortAndRender();

    sortName.addEventListener("change", function() {

        sortPrice.value = "price";

        sortAndRender();

    });

    sortPrice.addEventListener("change", function() {

        sortName.value = "name";

        sortAndRender();

    });
}


/* ---------- Add a New Offering page ---------- */

function initializeAddOfferingPage() {

    const form = document.querySelector(".offering-form");

    if (!form) return;

    const nameInput = document.getElementById("offering-name");
    const imageInput = document.getElementById("offering-image");
    const priceInput = document.getElementById("offering-price");
    const descriptionInput = document.getElementById("offering-description");

    let message = document.getElementById("form-message");

    if (!message) {

        message = document.createElement("p");
        message.id = "form-message";
        message.setAttribute("role", "status");
        message.setAttribute("aria-live", "polite");

        form.insertBefore(message, form.querySelector(".form-buttons"));
    }

    function showMessage(text, isSuccess) {

        message.textContent = text;

        message.className = isSuccess
            ? "form-message success"
            : "form-message error";
    }

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const priceText = priceInput.value.trim();
        const imageFile = imageInput.files[0];

        if (!name) {

            showMessage("Please enter the offering name.", false);
            nameInput.focus();
            return;
        }

        if (/^\d/.test(name)) {

            showMessage("The offering name must not start with a number.", false);
            nameInput.focus();
            return;
        }

        if (!imageFile) {

            showMessage("Please choose an image for the offering.", false);
            imageInput.focus();
            return;
        }

        if (!imageFile.type.startsWith("image/")) {

            showMessage("Please select a valid image file.", false);
            imageInput.focus();
            return;
        }

        if (
            priceText === "" ||
            !Number.isInteger(Number(priceText)) ||
            Number(priceText) < 0
        ) {

            showMessage("Please enter a valid whole-number price.", false);
            priceInput.focus();
            return;
        }

        if (!description) {

            showMessage("Please enter the offering description.", false);
            descriptionInput.focus();
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {

            const newOffering = {
                id: "offering-" + Date.now(),
                name: name,
                description: description,
                category: "New Offering",
                price: Number(priceText),
                image: reader.result
            };

            const offerings = getOfferings();

            offerings.push(newOffering);

            saveOfferings(offerings);

            showMessage(
                '"' + name + '" has been added successfully!',
                true
            );

            form.reset();
        };

        reader.onerror = function() {

            showMessage(
                "The image could not be read. Please try another image.",
                false
            );
        };

        reader.readAsDataURL(imageFile);

    });
}



/* ---------- Home Page: theme, back-to-top and live clock ---------- */

function initializeHomePageFeatures() {
    const homePage = document.body.classList.contains("home-page");
    if (!homePage) return;

    const themeButton = document.getElementById("theme-toggle");
    const backToTopButton = document.getElementById("back-to-top");
    const clock = document.getElementById("live-clock");

    // Restore the visitor's last selected theme (Light is the default).
    const savedTheme = localStorage.getItem("craftifyHomeTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }

    function updateThemeButton() {
        const darkMode = document.body.classList.contains("dark-theme");
        if (!themeButton) return;
        themeButton.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
        themeButton.setAttribute("aria-pressed", String(darkMode));
        themeButton.setAttribute("aria-label", darkMode ? "Switch to light theme" : "Switch to dark theme");
    }

    updateThemeButton();
    if (themeButton) {
        themeButton.addEventListener("click", function () {
            const darkMode = document.body.classList.toggle("dark-theme");
            localStorage.setItem("craftifyHomeTheme", darkMode ? "dark" : "light");
            updateThemeButton();
        });
    }

    function updateBackToTopVisibility() {
        if (!backToTopButton) return;
        backToTopButton.classList.toggle("is-visible", window.scrollY > 250);
    }

    updateBackToTopVisibility();
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    if (backToTopButton) {
        backToTopButton.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function updateClock() {
        if (!clock) return;
        const now = new Date();
        clock.textContent = "Current Time: " + now.toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
        });
    }

    updateClock();
    window.setInterval(updateClock, 1000);
}

/* ---------- Manager Dashboard page ---------- */

function initializeManagerDashboard() {

// Initialize where the Offering will display  

    const offeringsList = document.getElementById(
        "manager-offerings-list"
    );

// If there is no offering 

    const emptyMessage = document.getElementById(
        "no-offerings-message"
    );

// Making sure the elements exist  

    if (!offeringsList || !emptyMessage) return;

// geting the offering from "add new offering" page 

    const allOfferings = getOfferings();

// Display only offerings added by the manager

    const managerOfferings = allOfferings.filter(
        function(offering) {
            return String(offering.id).startsWith("offering-");
        }
    );

// If the Manager didnt add any offering 

    if (managerOfferings.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

// for every offering in the list, make card 

    managerOfferings.forEach(function(offering) {

        const card = document.createElement("article");
        card.className = "manager-offering-card";

        const image = document.createElement("img");
        image.src = offering.image;
        image.alt = offering.name;

        const details = document.createElement("div");
        details.className = "manager-offering-details";

        const name = document.createElement("h3");
        name.textContent = offering.name;

        const description = document.createElement("p");
        description.textContent = offering.description;

        const price = document.createElement("strong");
        price.textContent = "SAR " + offering.price;

        details.append(name, description, price);

        card.append(image, details);

// add it to the page

        offeringsList.appendChild(card);

    });
}


/* ---------- Manage Activity Leaders and Instructors ---------- */

// Making an array of object

let teamMembers = [

    {
        id: "member-1", // We added an ID since a name can be rebeted, and we need to identfy the right person when deleting
        name: "Maha Alsaeed",
        email: "maha@example.com",
        role: "Instructor",
        specialty: "Creative Crafts",
        offerings: 2,
        status: "Active",
        profile: "profile-maha.html",
        bio: "Creative crafts instructor."
    },

    {
        id: "member-2",
        name: "Lama Alharbi",
        email: "lama@example.com",
        role: "Activity Leader",
        specialty: "Pottery",
        offerings: 1,
        status: "Active",
        profile: "profile-lama.html",
        bio: "Pottery activity leader."
    },

    {
        id: "member-3",
        name: "Hessa Alotaibi",
        email: "hessa@example.com",
        role: "Instructor",
        specialty: "Candle Making",
        offerings: 1,
        status: "Active",
        profile: "profile-hessa.html",
        bio: "Candle making instructor."
    },

    {
        id: "member-4",
        name: "Dana Alqahtani",
        email: "dana@example.com",
        role: "Instructor",
        specialty: "Painting",
        offerings: 1,
        status: "On Leave",
        profile: "profile-dana.html",
        bio: "Painting instructor."
    }

];


function displayTeamMembers() {

    const tableBody = document.getElementById( 
        "team-members-list"
    ); // Where to place the results

    tableBody.innerHTML = "";

    teamMembers.forEach(function(member) { // For every object in the array "member"

        // A row first
        const row = document.createElement("tr");  

        // Checkbox
        const selectCell = document.createElement("td");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "team-member-checkbox";
        checkbox.value = member.id;

        selectCell.appendChild(checkbox);

        // Name
        const nameCell = document.createElement("td");
        const name = document.createElement("strong");

        name.textContent = member.name; // It get the name from the object
        nameCell.appendChild(name);

        // Role
        const roleCell = document.createElement("td");
        roleCell.textContent = member.role;

        // Specialty
        const specialtyCell = document.createElement("td");
        specialtyCell.textContent = member.specialty;

        // Offerings
        const offeringsCell = document.createElement("td");
        offeringsCell.textContent = member.offerings;

        // Status
        const statusCell = document.createElement("td");
        const status = document.createElement("span");

        status.textContent = member.status;

        status.className = member.status === "Active"
            ? "manager-status active"
            : "manager-status pending";

        statusCell.appendChild(status);

        // Profile
        const profileCell = document.createElement("td");

        if (member.profile) {

            const profileLink = document.createElement("a");

            profileLink.href = member.profile;
            profileLink.textContent = "View Profile";
            profileLink.className = "manager-text-link";

            profileCell.appendChild(profileLink);

        } else {

            profileCell.textContent = "—";

        }

        // Add all cells to the row
        row.append(
            selectCell,
            nameCell,
            roleCell,
            specialtyCell,
            offeringsCell,
            statusCell,
            profileCell
        );

        tableBody.appendChild(row);

    });

}

       /* === DELETING A MEMBER === */

function deleteTeamMembers() {

    // Calculates number of checked box
    const selectedCheckboxes = document.querySelectorAll(
        ".team-member-checkbox:checked" 
    );

    // Check if at least one person is selected
    if (selectedCheckboxes.length === 0) {

        alert("Please select at least one person to delete.");

        return;
    }

    // Ask for confirmation
    const confirmDelete = confirm(
        "Are you sure you want to delete the selected team members?"
    );

    if (!confirmDelete) {
        return;
    }

    // Get selected IDs 
    const selectedIds = Array.from(selectedCheckboxes).map(
        function(checkbox) {
            return checkbox.value;
        }
    );

    // Remove selected members ONLY
    teamMembers = teamMembers.filter(
        function(member) {
            return !selectedIds.includes(member.id);
        }
    );

    // Refresh the table
    displayTeamMembers();

    alert("Selected team members have been deleted successfully.");

}

       /* === ADDING TEAM MEMBER === */

function addTeamMember() {

    // Geting all the data from the form
    const form = document.getElementById("team-member-form");

    const name = document.getElementById(
        "instructor-name"
    ).value.trim();

    const email = document.getElementById(
        "instructor-email"
    ).value.trim();

    const role = document.getElementById(
        "instructor-role"
    ).value;

    const specialty = document.getElementById(
        "instructor-specialty"
    ).value;

    const bio = document.getElementById(
        "instructor-bio"
    ).value.trim();

    // Check empty fields
    if (!name || !email || !role || !specialty || !bio) {

        alert("Please fill in all fields.");

        return;
    }

    // Validate full name
    const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)+$/;

    if (!namePattern.test(name)) {

        alert("Please enter a valid full name.");

        return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert("Please enter a valid email address.");

        return;
    }

    // Create a new team member
    const newMember = {

        id: "member-" + Date.now(),

        name: name,

        email: email,

        role: role,

        specialty: specialty,

        offerings: 0,

        status: "Active",

        profile: null,

        bio: bio

    };

    // Add the new member to the array
    teamMembers.push(newMember);

    // Update the table
    displayTeamMembers();

    // Show success message
    alert(name + " has been added successfully!");

    // Clear the form
    form.reset();

}


      /* === THE FUNCTION THATS MANGES EVERY THING === */

function initializeTeamManagement() {

    const tableBody = document.getElementById(
        "team-members-list"
    );

    const deleteButton = document.getElementById(
        "delete-team-members"
    );

    const form = document.getElementById(
        "team-member-form"
    );

    // Make sure this is the Manage Team page
    if (!tableBody || !deleteButton || !form) {
        return;
    }

    // Display the initial team members
    displayTeamMembers();

    // Handle delete button
    deleteButton.addEventListener(
        "click",
        deleteTeamMembers
    );

    // Handle form submission
    form.addEventListener("submit", function(event) {

        event.preventDefault();

        addTeamMember();

    });

}



function applySavedTheme() {

    try {
        if (localStorage.getItem("craftifyHomeTheme") === "dark") {
            document.body.classList.add("dark-theme");
        }
    } catch (error) {
    }
}

function initializeAboutPage() {

    const form = document.querySelector(".join-form");
    if (!form) return;

    const fields = {
        name: document.getElementById("full-name"),
        photo: document.getElementById("photo"),
        dob: document.getElementById("dob"),
        email: document.getElementById("email"),
        expertise: document.getElementById("expertise"),
        skills: document.getElementById("skills"),
        education: document.getElementById("education")
    };

    function showError(input, message) {
        input.classList.add("field-error");
        const box = document.createElement("p");
        box.className = "error-message";
        box.textContent = message;
        input.parentNode.appendChild(box);
    }

    function clearErrors() {
        form.querySelectorAll(".error-message").forEach(function (el) { el.remove(); });
        form.querySelectorAll(".field-error").forEach(function (el) { el.classList.remove("field-error"); });
    }

    function isEmpty(input) {
        return input.value.trim() === "";
    }

    function validate() {
        const problems = [];   

        if (isEmpty(fields.name)) {
            problems.push([fields.name, "Name is required."]);
        } else if (/^\d/.test(fields.name.value.trim())) {
            problems.push([fields.name, "Name cannot start with a number."]);
        }

        const file = fields.photo.files[0];
        if (!file) {
            problems.push([fields.photo, "Please upload a photo."]);
        } else if (file.type.indexOf("image/") !== 0) {
            problems.push([fields.photo, "The photo must be an image file (JPG or PNG)."]);
        }

        if (isEmpty(fields.dob)) {
            problems.push([fields.dob, "Date of birth is required."]);
        } else {
            const year = parseInt(fields.dob.value.split("-")[0], 10);
            if (isNaN(year) || year > 2008) {
                problems.push([fields.dob, "Year of birth must be 2008 or earlier."]);
            }
        }

        if (isEmpty(fields.email)) {
            problems.push([fields.email, "Email is required."]);
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) {
            problems.push([fields.email, "Enter a valid email address."]);
        }

        if (fields.expertise.value === "") {
            problems.push([fields.expertise, "Select an area of expertise."]);
        }

        if (isEmpty(fields.skills)) {
            problems.push([fields.skills, "Skills are required."]);
        }
        if (isEmpty(fields.education)) {
            problems.push([fields.education, "Education is required."]);
        }

        return problems;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();   

        try {
            clearErrors();

            const problems = validate();
            if (problems.length > 0) {
                problems.forEach(function (p) { showError(p[0], p[1]); });
                alert("Please fix the following before submitting:\n\n- " +
                    problems.map(function (p) { return p[1]; }).join("\n- "));
                problems[0][0].focus();
                return;
            }

            const name = fields.name.value.trim();
            alert("Thank you, " + name + "! Your application to join the Craftify Club team has been received. We will contact you soon.");
            form.reset();
        } catch (error) {
            alert("Something went wrong: " + error.message);
        }
    });

    function removeFieldError(event) {
        const input = event.target;
        input.classList.remove("field-error");
        const message = input.parentNode.querySelector(".error-message");
        if (message) { message.remove(); }
    }

    form.addEventListener("input", removeFieldError);
    form.addEventListener("change", removeFieldError);
}

function initializeEvaluatePage() {

    const form = document.getElementById("evaluation-form");
    if (!form) return;

    const select = document.getElementById("offering");
    const stars = form.querySelector(".star-rating");
    const feedback = document.getElementById("feedback");

    function markError(element, message) {
        element.classList.add("field-error");
        const box = document.createElement("p");
        box.className = "error-message";
        box.textContent = message;
        element.parentNode.appendChild(box);
    }

    function clearErrors() {
        form.querySelectorAll(".error-message").forEach(function (el) { el.remove(); });
        form.querySelectorAll(".field-error").forEach(function (el) { el.classList.remove("field-error"); });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        try {
            clearErrors();

            let firstBad = null;
            const rating = form.querySelector('input[name="rating"]:checked');

            if (select.value === "") {
                markError(select, "Please select an offering.");
                firstBad = firstBad || select;
            }
            if (!rating) {
                markError(stars, "Please add a rating.");
                firstBad = firstBad || stars.querySelector("input");
            }
            if (feedback.value.trim() === "") {
                markError(feedback, "Please write your feedback.");
                firstBad = firstBad || feedback;
            }

            if (firstBad) {
                firstBad.focus();
                return;
            }

            if (parseInt(rating.value, 10) >= 4) {
                alert("Thank you for your great rating! We are glad you enjoyed it.");
            } else {
                alert("We are sorry your experience was not better. Thank you for your feedback, we will work on improving.");
            }

            window.location.href = "MemberDashboard.html";
        } catch (error) {
            alert("Something went wrong: " + error.message);
        }
    });

    function removeError(element) {
        element.classList.remove("field-error");
        const message = element.parentNode.querySelector(".error-message");
        if (message) { message.remove(); }
    }

    select.addEventListener("change", function () { removeError(select); });
    feedback.addEventListener("input", function () { removeError(feedback); });
    form.querySelectorAll('input[name="rating"]').forEach(function (radio) {
        radio.addEventListener("change", function () { removeError(stars); });
    });
}


/* ---------- Request to Join an Offering Page ---------- */

function initializeRequestPage() {

    const form = document.querySelector(".request-form");

    if (!form) return;

    const offering = document.getElementById("offering");
    const name = document.getElementById("full-name");
    const date = document.getElementById("preferred-date");

    // Store new requests while the member stays on the page
    const requests = [];

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        let errors = [];

        // Check offering selection
        if (offering.value === "") {
            errors.push("Please select an offering.");
        }

        // Check full name
        const namePattern = /^[\p{L}]+(?:[ '-][\p{L}]+)+$/u;

        if (!namePattern.test(name.value.trim())) {
            errors.push("Please enter your full name without numbers or invalid characters.");
        }

        // Check preferred date
        const today = new Date();
        const todayString =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        if (date.value === "" || date.value <= todayString) {
            errors.push("Preferred date must be a future date.");
        }

        // Display validation errors
        if (errors.length > 0) {
            alert("Please correct the following:\n\n- " + errors.join("\n- "));
            return;
        }

        // Get selected offering name
        const offeringName = offering.options[offering.selectedIndex].text;

        // Create request object
        const newRequest = {
            offering: offeringName,
            memberName: name.value.trim(),
            preferredDate: date.value
        };

        // Confirmation message
        const stay = confirm(
            "Your request has been sent successfully!\n\n" +
            "Do you want to stay on this page?\n\n" +
            "OK: Stay on this page\n" +
            "Cancel: Return to Member Dashboard"
        );

        if (stay) {

            // Add request to the list
            requests.push(newRequest);

            let requestSection = document.getElementById("request-list");

            if (!requestSection) {
                requestSection = document.createElement("div");
                requestSection.id = "request-list";

                const heading = document.createElement("h2");
                heading.textContent = "Your Participation Requests";

                requestSection.appendChild(heading);
                form.after(requestSection);
            }

            // Display request information
            const requestItem = document.createElement("div");

            const offeringText = document.createElement("p");
            offeringText.textContent = "Offering: " + newRequest.offering;

            const nameText = document.createElement("p");
            nameText.textContent = "Member Name: " + newRequest.memberName;

            const dateText = document.createElement("p");
            dateText.textContent = "Preferred Date: " + newRequest.preferredDate;

            requestItem.appendChild(offeringText);
            requestItem.appendChild(nameText);
            requestItem.appendChild(dateText);

            requestSection.appendChild(requestItem);

            // Reset form for another request
            form.reset();

        } else {

            // Return to Member Dashboard
            window.location.href = "MemberDashboard.html";

        }

    });

}

// Initialize Request Page
document.addEventListener("DOMContentLoaded", function() {
    initializeRequestPage();
});


document.addEventListener("DOMContentLoaded", function() {

    applySavedTheme();

    initializeAboutPage();

    initializeEvaluatePage();

    initializeOfferingsPage();

    initializeAddOfferingPage();

    initializeHomePageFeatures();

    initializeManagerDashboard();

    initializeTeamManagement();

});
