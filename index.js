import { Command } from "commander";
import fs from "fs";
import inquirer from "inquirer";

const program = new Command();

let questionData;

console.log("Welcome to Quiz App");

const name = await inquirer.prompt([
    {
        type: "input",
        name: "username",
        message: "Enter your name:"
    }
]);

console.log(`hello ${name.username} welcome to quiz app`);

program
    .name("quiz-app")
    .description("CLI Quiz Application")
    .version("1.0.0");


// =======================
// ADD QUESTION
// =======================
program.command("add question")
    .description("Add a new question")
    .action(async () => {

        const answers = await inquirer.prompt([
            {
                type: "select",
                name: "questionType",
                message: "Choose question type:",
                choices: ["Multiple Choice", "True/False", "Short Answer"],
            }
        ]);

        switch (answers.questionType) {

            case "Multiple Choice":
                const mcqAnswers = await inquirer.prompt([
                    {
                        type: "input",
                        name: "question",
                        message: "Enter question:"
                    },
                    {
                        type: "input",
                        name: "options",
                        message: "Enter options (comma separated):"
                    },
                    {
                        type: "input",
                        name: "correctAnswer",
                        message: "Enter correct answer:"
                    }
                ]);

                questionData = {
                    name: name.username,
                    type: answers.questionType,
                    question: mcqAnswers.question,
                    options: mcqAnswers.options.split(",").map(o => o.trim()),
                    correctAnswer: mcqAnswers.correctAnswer
                };
                break;

            case "True/False":
                const tf = await inquirer.prompt([
                    {
                        type: "input",
                        name: "question",
                        message: "Enter question:"
                    },
                    {
                        type: "select",
                        name: "correctAnswer",
                        choices: ["True", "False"]
                    }
                ]);

                questionData = {
                    name: name.username,
                    type: answers.questionType,
                    question: tf.question,
                    options: ["True", "False"],
                    correctAnswer: tf.correctAnswer
                };
                break;

            case "Short Answer":
                const sa = await inquirer.prompt([
                    {
                        type: "input",
                        name: "question",
                        message: "Enter question:"
                    },
                    {
                        type: "input",
                        name: "correctAnswer",
                        message: "Enter correct answer:"
                    }
                ]);

                questionData = {
                    name: name.username,
                    type: answers.questionType,
                    question: sa.question,
                    correctAnswer: sa.correctAnswer
                };
                break;
        }

        if (!fs.existsSync("questions.json")) {
            fs.writeFileSync("questions.json", JSON.stringify([questionData], null, 2));
        } else {
            const existing = JSON.parse(fs.readFileSync("questions.json"));
            existing.push(questionData);
            fs.writeFileSync("questions.json", JSON.stringify(existing, null, 2));
        }

        console.log("Question added successfully!");
    });


// =======================
// START QUIZ
// =======================
program.command("start quiz")
    .description("Start quiz")
    .action(async () => {

        if (!fs.existsSync("questions.json")) {
            console.log("No questions found");
            return;
        }

        const questions = JSON.parse(fs.readFileSync("questions.json"));

        console.log("Starting Quiz...");

        let result = 0;

        for (const question of questions) {

            let answer;

            switch (question.type) {

                case "Multiple Choice":
                case "True/False":
                    answer = await inquirer.prompt([
                        {
                            type: "select",
                            name: "userAnswer",
                            message: question.question,
                            choices: question.options
                        }
                    ]);
                    break;

                case "Short Answer":
                    answer = await inquirer.prompt([
                        {
                            type: "input",
                            name: "userAnswer",
                            message: question.question
                        }
                    ]);
                    break;
            }

            const userAnswer = answer.userAnswer;

            if (
                userAnswer?.trim().toLowerCase() ===
                question.correctAnswer?.trim().toLowerCase()
            ) {
                result++;
                console.log("Correct!");
            } else {
                console.log("Wrong!");
            }
        }

        const percentage = Math.round((result / questions.length) * 100);

        console.log("================================");
        console.log(`Final Score: ${result}/${questions.length}`);
        console.log(`Percentage: ${percentage}%`);
        console.log("================================");

        const userResult = {
            name: name.username,
            score: result,
            total: questions.length,
            percentage,
            date: new Date().toLocaleString()
        };

        let results = [];

        if (fs.existsSync("answers.json")) {
            results = JSON.parse(fs.readFileSync("answers.json"));
        }

        results.push(userResult);

        fs.writeFileSync("answers.json", JSON.stringify(results, null, 2));
    });


// =======================
// VIEW RESULTS
// =======================
program.command("view results")
    .description("View all results")
    .action(() => {

        if (!fs.existsSync("answers.json")) {
            console.log("No results yet");
            return;
        }

        const results = JSON.parse(fs.readFileSync("answers.json"));

        console.log("Quiz Results:");
        console.table(results);
    });


program.parse(process.argv);