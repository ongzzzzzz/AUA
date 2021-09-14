const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send("I'm not dead! :D"));
app.listen(port, () => console.log(`listening at http://localhost:${port}`));

const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = "./friend";

const Database = require("@replit/database");
const db = new Database();
const fs = require('fs');

let quiz = require('./quiz.json');
const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
	client.user.setActivity("with ur mind 🧠✨",
		{ type: "PLAYING" });
});

let users = {};
/* struct
{
	id : {
		score,
		questionsHaventDone,
	}
}
*/

client.on('message', async message => {
	if (message.author.bot) return;

	// if is in DMs
	if (message.guild === null) {
		// if the user hasn't started playing, new user
		if (!Object.keys(users).includes(message.author.id)) {
			message.channel.send("hellooo this ur first time here \nthink fast tho cus u got 8 seconds for each");

			await sleep(3000);

			users[message.author.id] = {
				score: 0,
				questions: quiz,
			}
		}

		await askQuestion(message, users[message.author.id].questions);
	}

	if (!message.content.startsWith(prefix)) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	console.log(command);
});

client.login(process.env.BOT_TOKEN);





async function askQuestion(message, questions) {
	if (questions.length == 0) {
		let finalScore = users[message.author.id].score;
		message.channel.send("**congrats!!** u finished with score of " + finalScore);

		if (finalScore == quiz.length) {
			message.channel.send("big brain, full marks");
			message.channel.send(`here's the big secret link that u wanted: <${process.env.SECRET_LINK}>`)
		} else {
			message.channel.send("lol good try but got room for improvement uwu");
		}

		users[message.author.id].score = 0;
		users[message.author.id].questions = quiz;
		
		return;
	}

	let question = questions[Math.floor(Math.random() * questions.length)];

	const quesEmbed = {
		color: 0x0099ff,
		title: question.question,
		fields: [
			{
				name: "1️⃣ " + question.choices[0],
				value: "\u200B",
			},
			{
				name: "2️⃣ " + question.choices[1],
				value: "\u200B",
			},
			{
				name: "3️⃣ " + question.choices[2],
				value: "\u200B",
			},
			{
				name: "4️⃣ " + question.choices[3],
				value: "\u200B",
			},
		],
		timestamp: new Date(),
	};

	let ques = await message.channel.send({ embed: quesEmbed }).then(m => {
		m.react("1️⃣"); m.react("2️⃣"); m.react("3️⃣"); m.react("4️⃣");
		return m;
	});

	const filter = (reaction, user) => {
		// console.log(reaction.emoji.name)
		return emojis.includes(reaction.emoji.name) && !user.bot;
	};

	ques.awaitReactions(filter, { time: 8000 })
		.then(collected => {
			// console.log([...collected.keys()])
			// console.log(collected.size)

			if (collected.size > 1) {
				message.channel.send("naughty naughty ar why hand gatai choose more \nnow i restart >:((");
			} else if (collected.size == 0) {
				message.channel.send("lol why u no react \nnow i restart :(");
			} else {
				let choice = emojis.indexOf([...collected.keys()][0]);
				if (choice === question.answer) {
					message.channel.send("bingo! onto the next one");
					users[message.author.id].score += 1;
				} else {
					message.channel.send("oof wrong");
				}
				users[message.author.id].questions =
					users[message.author.id].questions.filter(x => x !== question);
				askQuestion(message, users[message.author.id].questions)
			}
		})
		.catch(collected => {
			message.channel.send("too late lol try again")
		});
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
