// On instancie DiscordJS
const Discord = require("discord.js");
const {
    BOT_TOKEN,
    PREFIX
} = require("./config");

// On importe sequelize
const {
    Sequelize
} = require("sequelize");

const client = new Discord.Client({
    partials: [
        "MESSAGE",
        "REACTION"
    ]
})

// On se connecte à la base mysql
const sequelize = new Sequelize("discord-bot", "root", "", {
    host: "localhost",
    dialect: "mysql",
    logging: false
});

// On importe le modèle Commands
const Commands = require("./Models/Commands")(sequelize, Sequelize.DataTypes);

// On attend que le bot soit prêt
client.on("ready", () => {
    // On instancie le modèle Commands
    Commands.sync();

    // On change le statut
    client.user.setPresence({
            activity: {
                name: 'en pleine démo Live Coding'
            },
            status: 'dnd'
        })
        .then(console.log)
        .catch(console.error)
})

// On réagit à une commande
client.on("message", (message) => {
    if (message.content.startsWith(PREFIX)) {
        // On récupère un tableau des arguments sans le préfixe
        const input = message.content.slice(PREFIX.length).trim().split(" ");

        // On récupère la commande
        const command = input.shift();

        // On transforme les arguments en chaine de caractères
        const commandArgs = input.join(' ');

        // On recherche la commande dans la base de données
        // SELECT id, command, message, deleteMessage FROM commands WHERE command = :command LIMIT 1
        Commands.findOne({
            attributes: ["id", "command", "message", "deleteMessage"],
            where: {
                command: command
            }
        }).then(response => {
            // On traite la réponse
            // On envoie le message
            message.channel.send(response.message);

            // Si deleteMessage est à true, supprimer le message d'appel
            if (response.deleteMessage) message.delete();
        }).catch(e => console.log);

        switch (command) {
            // case "!bienvenue":
            //     message.channel.send("Bonjour et bienvenue à toutes et tous")
            //     message.delete()
            // break
            case "addCommand":
                // On récupère les arguments
                const options = commandArgs.split("///");

                const newCommand = Commands.create({
                    command: options[0],
                    message: options[1],
                    deleteMessage: options[2]
                }).then(() => {
                    message.reply("Commande ajoutée");
                }).catch(e => {
                    if(e.name === "SequelizeUniqueConstaintError"){
                        message.reply("Cette commande existe déjà");
                    }
                    message.reply("Une erreur est survenue");
                })
                break;

            case "listCommands":
                // On affiche la liste des commandes
                Commands.findAll({
                    attributes: ["id", "command", "message", "deleteMessage"]
                }).then(list => {
                    const liste = list.map(
                        command => `${command.id} - ${command.command} - ${command.message} - ${command.deleteMessage}`
                    ).join("\n") || "Pas de commandes";
                    message.channel.send(`Liste des commandes:\n${liste}`, {split: true});
                })
                break;
            case "deleteCommand":
                Commands.destroy({
                    where: {
                        id: commandArgs
                    }
                }).then(rowCount => {
                    if(!rowCount) return message.reply("Commande inexistante");

                    return message.reply("Commande supprimée");
                });
        }
    }
    if (message.content.indexOf("bonjour") != -1) {
        message.channel.send("Bonjour à toi aussi")
    }
    if (message.content.indexOf("!attention") === 0) {
        let param = message.content.substr(11)
        let texte = (param != "") ? param : "Attention"
        message.channel.send(`${texte}, ce salon n'est pas dédié à l'aide technique`)
        message.delete()
    }

    // Alerter lorsque plus de 2 mentions
    // On récupère les mentions
    let mentions = message.mentions.users.array()
    if (mentions.length > 2) {
        message.channel.send(`<@${message.member.user.id}>, merci de ne pas abuser des mentions`)
    }
})

// On écoute l'ajout de réactions
client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.id === "idDuMessage" && reaction.emoji.name === "✅") {
        // On attribue le rôle "membre" à l'utilisateur qui a réagi
        let role = reaction.message.guild.roles.cache.get("idDuRole")
        let member = reaction.message.guild.members.cache.get(user.id)
        if (role && member) {
            member.roles.add(role)
        }
    }
})

client.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.message.id === "idDuMessage" && reaction.emoji.name === "✅") {
        // On attribue le rôle "membre" à l'utilisateur qui a réagi
        let role = reaction.message.guild.roles.cache.get("idDuRole")
        let member = reaction.message.guild.members.cache.get(user.id)
        if (role && member) {
            member.roles.remove(role)
        }
    }
})

// On surveille les nouveaux membres
// <@123456789>
client.on("guildMemberAdd", member => {
    // Message public
    client.channels.resolve("idDuRole").send(`Bienvenue <@${member.user.id}> sur ce serveur de démo`)

    // Message privé
    member.send(`Bienvenue <@${member.user.id}> sur ce serveur de démo`)
})

// On se connecte
client.login(BOT_TOKEN);