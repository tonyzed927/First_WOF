# Rules Wheel Challenge

A solo, browser-based game-show study scaffold for people preparing for the R&A Level 3 Rules exam.

## How to test locally

1. Run the syntax/unit checks:

   ```bash
   npm test
   ```

2. Start the local web server:

   ```bash
   npm start
   ```

3. Open the app in your browser at:

   ```text
   http://127.0.0.1:4173
   ```

4. Manual smoke test:
   - Click **Start solo game**.
   - Pick a category or leave **All categories** selected.
   - Click **Spin the wheel**.
   - Select an answer.
   - Click **Lock in answer**.
   - Confirm the result panel shows an explanation and citation.
   - Click **Next question**.
   - Deliberately answer one question incorrectly, then use **Review missed questions** to check review mode.
   - Refresh the page and confirm your progress is restored from local storage.

## Content note

The app ships with 100 original, paraphrased practice questions and citation fields in `src/questionBank.js`. Review the references against your official R&A materials before using the questions for formal exam preparation.

This is an unofficial study aid and is not affiliated with or endorsed by The R&A.

## Official source links to verify references

- R&A Rules of Golf: https://www.randa.org/rog/the-rules-of-golf
- R&A Definitions: https://www.randa.org/rog/definitions?definitionsEdition=RulesOfGolf
- R&A Official Clarifications: https://www.randa.org/rog/clarifications
- R&A Committee Procedures / Model Local Rules: https://www.randa.org/en/rog/committee-procedures/8
