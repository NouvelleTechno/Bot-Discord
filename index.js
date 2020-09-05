// On instancie DiscordJS
const Discord = require("discord.js")
const client = new Discord.Client({
    partials: [
        "MESSAGE",
        "REACTION"
    ]
})

// On attend que le bot soit prêt
client.on("ready", () => {
    // On change le statut
    client.user.setPresence({ 
        activity: {
            name:'en pleine démo Live Coding'
        },
        status: 'dnd'
    })
    .then(console.log)
    .catch(console.error)
})

// On réagit à une commande
client.on("message", (message) => {
    switch(message.content){
        case "!bienvenue":
            message.channel.send("Bonjour et bienvenue à toutes et tous")
            message.delete()
        break
        case "!regles":
            message.channel.send("Merci de lire les règles dans le salon <#idDuSalon> :thumbsup:")
            message.delete()
        break
    }
    if(message.content.indexOf("bonjour") != -1){
        message.channel.send("Bonjour à toi aussi")
    }
    if(message.content.indexOf("!attention") === 0){
        let param = message.content.substr(11)
        let texte = (param != "") ? param : "Attention"
        message.channel.send(`${texte}, ce salon n'est pas dédié à l'aide technique`)
        message.delete()
    }

    // Alerter lorsque plus de 2 mentions
    // On récupère les mentions
    let mentions = message.mentions.users.array()
    if(mentions.length > 2){
        message.channel.send(`<@${message.member.user.id}>, merci de ne pas abuser des mentions`)
    }
})

// On écoute l'ajout de réactions
client.on("messageReactionAdd", async (reaction, user) => {
    if(reaction.message.id === "idDuMessage" && reaction.emoji.name === "✅"){
        // On attribue le rôle "membre" à l'utilisateur qui a réagi
        let role = reaction.message.guild.roles.cache.get("idDuRole")
        let member = reaction.message.guild.members.cache.get(user.id)
        if(role && member){
            member.roles.add(role)
        }
    }
})

client.on("messageReactionRemove", async (reaction, user) => {
    if(reaction.message.id === "idDuMessage" && reaction.emoji.name === "✅"){
        // On attribue le rôle "membre" à l'utilisateur qui a réagi
        let role = reaction.message.guild.roles.cache.get("idDuRole")
        let member = reaction.message.guild.members.cache.get(user.id)
        if(role && member){
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
client.login("Token du Bot")