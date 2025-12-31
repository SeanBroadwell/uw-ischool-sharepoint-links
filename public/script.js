<script>
  const cardGrid = document.getElementById("cardGrid");
  const addCardBtn = document.getElementById("addCardBtn");

  const DEFAULT_CARDS = [
    {
      title: "HR Resources",
      desc: "Internal HR policies and documents",
      link: "https://company.sharepoint.com/sites/hr"
    },
    {
      title: "IT Helpdesk",
      desc: "Submit tickets and view IT documentation",
      link: "https://company.sharepoint.com/sites/it"
    }
  ];

  function saveCards(cards) {
    localStorage.setItem("cards", JSON.stringify(cards));
  }

  function getCards() {
    return JSON.parse(localStorage.getItem("cards"));
  }

  function createCard(data) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="view-mode">
        <h2 class="card-title">${data.title}</h2>
        <p class="card-desc">${data.desc}</p>

        <div class="card-actions">
          <a class="card-link" href="${data.link}" target="_blank">Open Site</a>
          <button class="edit-btn">Edit</button>
        </div>
      </div>

      <div class="edit-mode hidden">
        <input class="edit-title" type="text" value="${data.title}" />
        <textarea class="edit-desc">${data.desc}</textarea>
        <input class="edit-link" type="url" value="${data.link}" />

        <div class="card-actions">
          <button class="save-btn">Save</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    attachCardLogic(card);
    return card;
  }

  function attachCardLogic(card) {
    const viewMode = card.querySelector(".view-mode");
    const editMode = card.querySelector(".edit-mode");

    const editBtn = card.querySelector(".edit-btn");
    const saveBtn = card.querySelector(".save-btn");
    const cancelBtn = card.querySelector(".cancel-btn");

    editBtn.onclick = () => {
      viewMode.classList.add("hidden");
      editMode.classList.remove("hidden");
    };

    cancelBtn.onclick = () => {
      editMode.classList.add("hidden");
      viewMode.classList.remove("hidden");
    };

    saveBtn.onclick = () => {
      viewMode.querySelector(".card-title").textContent =
        editMode.querySelector(".edit-title").value;
      viewMode.querySelector(".card-desc").textContent =
        editMode.querySelector(".edit-desc").value;
      viewMode.querySelector(".card-link").href =
        editMode.querySelector(".edit-link").value;

      editMode.classList.add("hidden");
      viewMode.classList.remove("hidden");

      persistAllCards();
    };
  }

  function persistAllCards() {
    const cards = [];
    document.querySelectorAll(".card").forEach(card => {
      cards.push({
        title: card.querySelector(".card-title").textContent,
        desc: card.querySelector(".card-desc").textContent,
        link: card.querySelector(".card-link").href
      });
    });
    saveCards(cards);
  }

  // INITIAL LOAD
  let cards = getCards();
  if (!cards) {
    saveCards(DEFAULT_CARDS);
    cards = DEFAULT_CARDS;
  }

  cardGrid.innerHTML = "";
  cards.forEach(c => cardGrid.appendChild(createCard(c)));

  // ADD CARD
  addCardBtn.onclick = () => {
    const newCard = {
      title: "New Card",
      desc: "Description",
      link: "#"
    };

    const card = createCard(newCard);
    cardGrid.appendChild(card);

    persistAllCards();
  };
</script>
