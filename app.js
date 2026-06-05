import {
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
}
from "./firebase.js";

const screens = {

  screen1:
    document.getElementById("screen1"),

  screen2:
    document.getElementById("screen2"),

  screen3:
    document.getElementById("screen3"),

  screen4:
    document.getElementById("screen4"),

  screen5:
    document.getElementById("screen5")

};

let participantId = null;

let gameResult = {

  passedQuiz: false,

  outcome: null,

  enteredLuckyDraw: false,

  incorrectQuestions: []

};

function showScreen(screenId) {

  Object.values(screens).forEach(screen => {

    screen.classList.add("hidden");

  });

  screens[screenId]
    .classList.remove("hidden");

}

async function saveParticipant(data) {

  try {

    const docRef =
      await addDoc(

        collection(
          db,
          "participants"
        ),

        {
          ...data,

          createdAt:
            serverTimestamp()

        }

      );

    participantId = docRef.id;

    console.log(
      "Participant saved:",
      participantId
    );

    return true;

  } catch (error) {

    console.error(
      "Firebase Error:",
      error
    );

    return false;

  }

}

async function saveGameResult() {

  try {

    await setDoc(

      doc(
        db,
        "gameResults",
        participantId
      ),

      {

        participantId,

        passedQuiz:
          gameResult.passedQuiz,

        outcome:
          gameResult.outcome,

        enteredLuckyDraw:
          gameResult.enteredLuckyDraw,

        incorrectQuestions:
  gameResult.incorrectQuestions,

        createdAt:
          serverTimestamp()

      }

    );

    console.log(
      "Game Result Saved"
    );

  } catch (error) {

    console.error(
      "Game Result Error:",
      error
    );

  }

}

async function drawPrize() {

  const inventoryRef =
    doc(
      db,
      "prizePool",
      "inventory"
    );

  const snapshot =
    await getDoc(
      inventoryRef
    );

  if (!snapshot.exists()) {

    console.error(
      "Inventory document missing"
    );

    return "luckydraw";

  }

  const inventory =
    snapshot.data();

  const prizePool = [];

  for (
    let i = 0;
    i < inventory.flashlight;
    i++
  ) {
    prizePool.push(
      "flashlight"
    );
  }

  for (
  let i = 0;
  i < inventory.phoneStand;
  i++
) {
  prizePool.push(
    "phoneStand"
  );
}

 for (
  let i = 0;
  i < inventory.jacket;
  i++
) {
  prizePool.push(
    "jacket"
  );
}

for (
  let i = 0;
  i < 307;
  i++
) {
  prizePool.push(
    "luckydraw"
  );
}

  if (
    prizePool.length === 0
  ) {

    return "luckydraw";

  }

  const outcome =
    prizePool[
      Math.floor(
        Math.random() *
        prizePool.length
      )
    ];

  if (outcome !== "luckydraw") {

  await updateDoc(
    inventoryRef,
    {
      [outcome]:
        inventory[outcome] - 1
    }
  );

}

  return outcome;

}

/* SCREEN 1 */

document
  .getElementById("screen1Btn")
  .addEventListener(
    "click",
    async () => {

    const name =
      document.getElementById("name").value;

const storename =
  document.getElementById("storename").value;

const accnumber =
  document.getElementById("accnumber").value;

const phonenumber =
  document.getElementById("phonenumber").value;

const salesRep =
  document.getElementById("salesRep").value;

if (
  !name ||
  !storename ||
  !accnumber ||
  !phonenumber ||
  !salesRep ||
  !document.getElementById("termsCheck").checked
) {

  alert(
    "Please complete all fields."
  );

  return;

}

const accountRegex = /^\d{6}$/;

if (!accountRegex.test(accnumber)) {

  alert(
    "Please enter a valid 6-digit account number."
  );

  return;

}

const phoneRegex =
  /^\+?[0-9]+$/;

if (!phoneRegex.test(phonenumber)) {

  alert(
    "Please enter a valid cellphone number."
  );

  return;

}

const saved =
  await saveParticipant({

    name,

    storeName: storename,

    accountNumber: accnumber,

    cellphone: phonenumber,

    salesRep

  });

if (!saved) {

  alert(
    "Unable to save participant."
  );

  return;

}

showScreen("screen2");

});

document.getElementById("accnumber")
  .addEventListener("input", function () {

    this.value =
      this.value.replace(/\D/g, "");

});

document.getElementById("phonenumber")
  .addEventListener("input", function () {

    this.value =
      this.value.replace(/[^0-9+]/g, "");

});

/* SCREEN 2 */

document
  .getElementById("screen2Btn")
  .addEventListener(
  "click",
  () => {

    // CHECK ALL QUESTIONS ANSWERED

const requiredQuestions = [
  "q1",
  "q2",
  "q3"
];

const unanswered =
  requiredQuestions.filter(
    question =>
      !document.querySelector(
        `input[name="${question}"]:checked`
      )
  );

if (unanswered.length > 0) {

  alert(
    "Please answer all questions before submitting."
  );

  return;

}

    // CORRECT ANSWERS
const answers = {
  q1: "SP320A",
  q2: "SP391A",
  q3: "SP160"
};

    let totalCorrect = 0;

    let totalWrong = 0;

    let wrongQuestions = [];

    // RESET ERRORS
    document
      .querySelectorAll(".question-group")
      .forEach(group => {

        group.classList.remove(
          "question-error"
        );

      });

    document
      .getElementById("quizError")
      .classList.add("hidden");

    // VALIDATE QUESTIONS
    Object.keys(answers).forEach(
      question => {

        const selected =
          document.querySelector(
            `input[name="${question}"]:checked`
          );

        if (
          selected &&
          selected.value === answers[question]
        ) {

          totalCorrect++;

        } else {

          totalWrong++;

          wrongQuestions.push(question);

          document
            .querySelector(
              `input[name="${question}"]`
            )
            .closest(".question-group")
            .classList.add(
              "question-error"
            );

        }

      }
    );

    // FINAL RESULT
if (totalWrong === 0) {

  gameResult.passedQuiz = true;

  gameResult.incorrectQuestions = [];

  showScreen("screen3");

} else {

  gameResult.passedQuiz = false;

gameResult.incorrectQuestions =
  wrongQuestions;

  // SHOW ERROR MESSAGE
  document
    .getElementById("quizError")
    .classList.remove("hidden");

  // CHANGE BUTTON TO CLOSE SESSION
document
  .getElementById("failedCloseBtn")
  .classList.remove("hidden");

document
  .getElementById("screen2Btn")
  .classList.add("hidden");

}

});

document
  .getElementById("failedCloseBtn")
  .addEventListener("click", async () => {

    await saveGameResult();

    resetSession();

});

/* SCREEN 3 */

const spinBtn =
  document.getElementById("spinBtn");

const wheel =
  document.getElementById("spinWheel");

let spinning = false;

const segmentAngles = {

  flashlight: 60,
  luckydraw: 0,
  phoneStand: 300,
  jacket: 180

};

function testSpin(outcome) {

  if (spinning) return;

  spinning = true;

  const wheel =
    document.getElementById("spinWheel");

  const baseRotation = 3600;

  const targetAngle =
    segmentAngles[outcome];

  const pointerOffset = 12;

const rotation =
  baseRotation + targetAngle + pointerOffset;

  wheel.style.transform =
  `rotate(${rotation - 60}deg)`;

  setTimeout(() => {

    spinning = false;

  }, 4000);

}

window.testSpin = testSpin;

spinBtn.addEventListener(
  "click",
  async () => {

    if (spinning) return;

    spinning = true;

    const resultTitle =
      document.getElementById("resultTitle");

    const resultText =
      document.getElementById("resultText");

    const prizeImage =
      document.getElementById("prizeImage");

const outcome =
  await drawPrize();
    
const baseRotation = 3600;

const targetAngle =
  segmentAngles[outcome];

const rotation =
  baseRotation + targetAngle;

    // SPIN ANIMATION
    wheel.style.transform =
  `rotate(${rotation - 60}deg)`;

    // WAIT FOR SPIN TO FINISH
    setTimeout(() => {

  gameResult.outcome =
    outcome;

  gameResult.enteredLuckyDraw =
    true;

  if (outcome === "flashlight") {

    prizeImage.src =
  "assets/flashlight.png";

  resultTitle.innerHTML =
    "🎉 Congratulations!";

  resultText.innerHTML =
    "You have won a Utility Flashlight!<br><br>You have also been entered into the grand prize lucky draw.";

  prizeImage.classList.remove(
  "hidden"
);

} else if (outcome === "phoneStand") {

  prizeImage.src =
    "assets/phone-stand.png";

  resultTitle.innerHTML =
    "🎉 Congratulations!";

  resultText.innerHTML =
    "You have won a Wireless Charging Phone Stand!<br><br>You have also been entered into the grand prize lucky draw.";

  prizeImage.classList.remove(
  "hidden"
);

} else if (outcome === "jacket") {

    prizeImage.src =
  "assets/jacket.png";

  resultTitle.innerHTML =
    "🎉 Congratulations!";

  resultText.innerHTML =
    "You have won a DUNLOP branded jacket!<br><br>You have also been entered into the grand prize lucky draw.";

  prizeImage.classList.remove(
  "hidden"
);

} else {

  resultTitle.innerHTML =
    "You're In The Lucky Draw!";

  resultText.innerHTML =
    "You did not win an instant prize today, but you have been entered into the grand prize lucky draw.";

  prizeImage.classList.add(
    "hidden"
  );

}

      spinning = false;

saveGameResult();

showScreen("screen4");

    }, 4000);

  }
);

/* SCREEN 4 */

document
  .getElementById("screen4Btn")
  .addEventListener("click", () => {

    showScreen("screen5");

  });

/* TERMS MODAL */

const termsModal =
  document.getElementById("termsModal");

document
  .getElementById("openTerms")
  .addEventListener("click", (e) => {

    e.preventDefault();

    e.stopPropagation();

    termsModal.classList.add("active");

  });

document
  .getElementById("acceptTerms")
  .addEventListener("click", () => {

    document.getElementById(
      "termsCheck"
    ).checked = true;

    termsModal.classList.remove(
      "active"
    );

  });

/* RESET SESSION FUNCTION */

function resetSession() {

  // CLEAR CUSTOMER DETAILS
  document.getElementById("name").value = "";
  document.getElementById("storename").value = "";
document.getElementById("accnumber").value = "";
document.getElementById("phonenumber").value = "";
document.getElementById("salesRep").value = "";

document
  .getElementById("screen2Btn")
  .classList.remove("hidden");

document
  .getElementById("failedCloseBtn")
  .classList.add("hidden");

  // RESET TERMS
  document.getElementById("termsCheck").checked = false;

  // CLEAR ALL RADIO BUTTONS
  document
    .querySelectorAll('input[type="radio"]')
    .forEach(radio => {

      radio.checked = false;

    });

  // REMOVE QUESTION ERROR STATES
  document
    .querySelectorAll(".question-group")
    .forEach(group => {

      group.classList.remove(
        "question-error"
      );

    });

  // HIDE QUIZ ERROR
  document
    .getElementById("quizError")
    .classList.add("hidden");

  // RESET WHEEL
  document.getElementById("spinWheel")
    .style.transform = "rotate(-60deg)";

  // RESET RESULTS
  document.getElementById("resultTitle")
    .innerHTML = "";

  document.getElementById("resultText")
    .innerHTML = "";

  document.getElementById("prizeImage")
    .classList.add("hidden");

  gameResult = {

  passedQuiz: false,

  outcome: null,

  enteredLuckyDraw: false,

  incorrectQuestions: []

};

participantId = null;

// RETURN TO SCREEN 1
showScreen("screen1");

}

/* CLOSE SESSION BUTTON */

const closeSessionBtn =
  document.getElementById(
    "closeSessionBtn"
  );

closeSessionBtn.onclick = () => {

  resetSession();

};
