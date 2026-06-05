import {
  db,
  collection,
  getDocs,
  getDoc,
  doc
}
from "./firebase.js";

async function loadDashboard() {

  try {

    // PARTICIPANTS

    const participantsSnapshot =
      await getDocs(
        collection(
          db,
          "participants"
        )
      );

    document.getElementById(
      "participantsCount"
    ).innerText =
      participantsSnapshot.size;

    // GAME RESULTS

    const gameResultsSnapshot =
      await getDocs(
        collection(
          db,
          "gameResults"
        )
      );

    let passedQuiz = 0;
    let failedQuiz = 0;
    let luckyDraw = 0;

    gameResultsSnapshot.forEach(doc => {

      const data = doc.data();

      if (data.passedQuiz) {

        passedQuiz++;

      } else {

        failedQuiz++;

      }

      if (data.enteredLuckyDraw) {

        luckyDraw++;

      }

    });

    document.getElementById(
      "passedCount"
    ).innerText =
      passedQuiz;

    document.getElementById(
      "failedCount"
    ).innerText =
      failedQuiz;

    document.getElementById(
      "luckyDrawCount"
    ).innerText =
      luckyDraw;

    // INVENTORY

    const inventorySnapshot =
      await getDoc(
        doc(
          db,
          "prizePool",
          "inventory"
        )
      );

    const inventory =
      inventorySnapshot.data();

    document.getElementById(
      "flashlightCount"
    ).innerText =
      inventory.flashlight;

    document.getElementById(
      "capCount"
    ).innerText =
      inventory.phoneStand;

    document.getElementById(
      "jacketCount"
    ).innerText =
      inventory.jacket;

    // WINNERS TABLE

const winnersBody =
  document.querySelector(
    "#winnersTable tbody"
  );

winnersBody.innerHTML = "";

for (
  const resultDoc
  of gameResultsSnapshot.docs
) {

  const result =
    resultDoc.data();

  if (
    result.outcome &&
    result.outcome !==
      "luckydraw"
  ) {

    const participantDoc =
      await getDoc(

        doc(
          db,
          "participants",
          result.participantId
        )

      );

    if (
      participantDoc.exists()
    ) {

      const participant =
        participantDoc.data();

      winnersBody.innerHTML += `
        <tr>
  <td>${participant.name}</td>
  <td>${participant.accountNumber}</td>
  <td>${participant.storeName}</td>
  <td>${result.outcome}</td>
</tr>
      `;

    }

  }

}

    // MOST MISSED QUESTIONS

const questionCounts = {
  q1: 0,
  q2: 0,
  q3: 0
};

gameResultsSnapshot.forEach(doc => {

  const data = doc.data();

  if (
    data.incorrectQuestions &&
    Array.isArray(
      data.incorrectQuestions
    )
  ) {

    data.incorrectQuestions
      .forEach(question => {

        if (
          questionCounts[
            question
          ] !== undefined
        ) {

          questionCounts[
            question
          ]++;

        }

      });

  }

});

const questionsBody =
  document.querySelector(
    "#questionsTable tbody"
  );

questionsBody.innerHTML = "";

Object.entries(
  questionCounts
).forEach(
  ([question, count]) => {

    questionsBody.innerHTML += `
      <tr>
        <td>${question}</td>
        <td>${count}</td>
      </tr>
    `;

  }
);

  } catch (error) {

    console.error(
      "Dashboard Error:",
      error
    );

  }

}

loadDashboard();

document
  .getElementById("exportExcel")
  .addEventListener(
    "click",
    async () => {

      const workbook =
        XLSX.utils.book_new();

      // PARTICIPANTS

      const participantsSnapshot =
        await getDocs(
          collection(
            db,
            "participants"
          )
        );

     const participants =
  participantsSnapshot.docs.map(doc => {

    const data = doc.data();

    return {

      Name:
        data.name,

      Store:
        data.storeName,

      AccountNumber:
        data.accountNumber,

      Cellphone:
        data.cellphone,

      SalesRep:
        data.salesRep,

      DateTime:
        data.createdAt
          ? data.createdAt
              .toDate()
              .toLocaleString()
          : ""

    };

  });

const participantsSheet =
  XLSX.utils.json_to_sheet(
    participants
  );

XLSX.utils.book_append_sheet(
  workbook,
  participantsSheet,
  "Participants"
);

      // GAME RESULTS

      const gameResultsSnapshot =
        await getDocs(
          collection(
            db,
            "gameResults"
          )
        );

      const gameResults =
        gameResultsSnapshot.docs.map(
          doc => doc.data()
        );

      const failedQuiz =
  gameResults.filter(
    result =>
      result.passedQuiz === false
  );

const luckyDraw =
  gameResults.filter(
    result =>
      result.enteredLuckyDraw === true
  );

     const winners = [];

for (const result of gameResults) {

  if (
    result.outcome &&
    result.outcome !== "luckydraw"
  ) {

    const participantDoc =
      await getDoc(
        doc(
          db,
          "participants",
          result.participantId
        )
      );

    if (participantDoc.exists()) {

      const participant =
        participantDoc.data();

      winners.push({

  Name:
    participant.name,

  AccountNumber:
    participant.accountNumber,

  Store:
    participant.storeName,

  Prize:
    result.outcome,

  DateTime:
    result.createdAt
      ? result.createdAt
          .toDate()
          .toLocaleString()
      : ""

});

    }

  }

}

const winnersSheet =
  XLSX.utils.json_to_sheet(
    winners
  );

XLSX.utils.book_append_sheet(
  workbook,
  winnersSheet,
  "Winners"
);
      // LUCKY DRAW

      const luckyDrawExport = [];

for (const result of luckyDraw) {

  const participantDoc =
    await getDoc(
      doc(
        db,
        "participants",
        result.participantId
      )
    );

  if (participantDoc.exists()) {

    const participant =
      participantDoc.data();

    luckyDrawExport.push({

      Name:
        participant.name,

      AccountNumber:
        participant.accountNumber,

      DateTime:
        result.createdAt
          ? result.createdAt
              .toDate()
              .toLocaleString()
          : ""

    });

  }

}

const luckyDrawSheet =
  XLSX.utils.json_to_sheet(
    luckyDrawExport
  );

XLSX.utils.book_append_sheet(
  workbook,
  luckyDrawSheet,
  "Lucky Draw"
);

      // FAILED QUIZ

      const failedQuizExport = [];

for (const result of failedQuiz) {

  const participantDoc =
    await getDoc(
      doc(
        db,
        "participants",
        result.participantId
      )
    );

  if (participantDoc.exists()) {

    const participant =
      participantDoc.data();

    failedQuizExport.push({

      Name:
        participant.name,

      AccountNumber:
        participant.accountNumber,

      IncorrectQuestions:
        result.incorrectQuestions
          ? result.incorrectQuestions.join(", ")
          : "",

      DateTime:
        result.createdAt
          ? result.createdAt
              .toDate()
              .toLocaleString()
          : ""

    });

  }

}

const failedSheet =
  XLSX.utils.json_to_sheet(
    failedQuizExport
  );

XLSX.utils.book_append_sheet(
  workbook,
  failedSheet,
  "Failed Quiz"
);

      // MISSED QUESTIONS

      const questionCounts = {
  q1: 0,
  q2: 0,
  q3: 0
};

      gameResults.forEach(
        result => {

          if (
            result.incorrectQuestions
          ) {

            result
              .incorrectQuestions
              .forEach(
                question => {

                  questionCounts[
                    question
                  ]++;

                }
              );

          }

        }
      );

      const questionsSummary =
        Object.entries(
          questionCounts
        ).map(
          ([question, count]) => ({

            Question:
              question,

            IncorrectCount:
              count

          })
        );

      const questionsSheet =
        XLSX.utils.json_to_sheet(
          questionsSummary
        );

      XLSX.utils.book_append_sheet(
        workbook,
        questionsSheet,
        "Question Summary"
      );

      const now =
        new Date();

      const timestamp =
        now
          .toISOString()
          .replace(/[:]/g, "-")
          .split(".")[0];

      XLSX.writeFile(
        workbook,
        `Q3_TBR_Wave_Steer_Report_${timestamp}.xlsx`
      );

    }
  );
