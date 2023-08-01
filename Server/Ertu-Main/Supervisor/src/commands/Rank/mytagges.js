const { ApplicationCommandOptionType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const yetkis = require("../../../../../../Global/Schemas/yetkis");
const ertum = require("../../../../../../Global/Settings/Setup.json");
const ertucuk = require("../../../../../../Global/Settings/System");
const taggeds = require("../../../../../../Global/Schemas/taggeds");
const { red } = require("../../../../../../Global/Settings/Emojis.json");
const kanal = require("../../../../../../Global/Settings/AyarName");

module.exports = {
    name: "taglılarım",
    description: "",
    category: "RANK",
    cooldown: 0,
    command: {
      enabled: true,
      aliases: [],
      usage: "", 
    },
  

    onLoad: function (client) { },

    onCommand: async function (client, message, args, ertuembed) {

      let kanallar = kanal.KomutKullanımKanalİsim;
     if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !kanallar.includes(message.channel.name)) return message.reply({ content: `${kanallar.map(x => `${client.channels.cache.find(chan => chan.name == x)}`)} kanallarında kullanabilirsiniz.`}).then((e) => setTimeout(() => { e.delete(); }, 10000)); 

        if(!ertum.ConfirmerRoles.some(ertuu => message.member.roles.cache.has(ertuu)) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
        {
        message.react(red)
        message.reply({ content:`Yeterli yetkin yok!`}).then((e) => setTimeout(() => { e.delete(); }, 5000)); 
        return }
        var sayi = 1
        var currentPage = 1
        var taglılar = [];
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const taglilarim = await taggeds.findOne({guildID:message.guild.id,userID:member.id});     
        for (let index = 0; index < taglilarim.users.length; index++) {
            sayi++
            const info = taglilarim.users[index];
            taglılar.push({UserID: info.memberId, Date:info.date})
        }
        let pages = taglılar.chunk(10)
        let geri = new ButtonBuilder().setCustomId('geri').setEmoji("⏮️").setLabel("Önce ki Sayfa").setStyle(ButtonStyle.Secondary);
        let carpi = new ButtonBuilder().setCustomId('ileri').setEmoji("❌").setLabel("Sayfaları Kapat").setStyle(ButtonStyle.Danger)
        let ileri = new ButtonBuilder().setCustomId('cancel').setEmoji("⏭️").setLabel("Sonra ki Sayfa").setStyle(ButtonStyle.Secondary)
        if(sayi < 5){
    geri.setDisabled(true);
    ileri.setDisabled(true);
    }
    message.channel.send({ components: [new ActionRowBuilder()
      .addComponents(
          geri,
        carpi,
          ileri
    
      )],embeds:[
        ertuembed.setDescription(`${member}, toplamda **${taglilarim.count}** kişiyi taga davet etmişsin.`)
      .addFields({name:"Taglıların:",value:`${pages[currentPage - 1].map((x,index)=> `${index + 1}. ${message.guild.members.cache.get(x.UserID).user.tag} - <t:${(x.Date/1000).toFixed()}> (<t:${(x.Date/1000).toFixed()}:R>`)})`})
    ]})
      .then(async msg =>{
        var filter = (button) => button.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000*2 })
        collector.on('collect', async (button, user) => {
            await button.deferUpdate();
        if (button.customId === "ileri") {
          if (currentPage == pages.length) return;
          currentPage++;
          await msg.edit({ components: [new ActionRowBuilder()
            .addComponents(
                geri,
               carpi,
                ileri
          
            )],embeds:[
                ertuembed.setDescription(`${member}, toplamda **${taglilarim.count}** kişiyi taga davet etmişsin.`)
            .addFields({name:"Taglıların:",value:`${pages[currentPage - 1].map((x,index)=> `${index + 1}. ${message.guild.members.cache.get(x.UserID).name} - <t:${(x.Date/1000).toFixed()}> (<t:${(x.Date/1000).toFixed()}:R>`)})`})
          ]})
        }
        if (button.customId === "geri") {
          if (currentPage == pages.length) return;
          currentPage--;
          await msg.edit({ components: [new ActionRowBuilder()
            .addComponents(
                geri,
                carpi,
                ileri
          
            )],embeds:[
                ertuembed.setDescription(`${member}, toplamda **${taglilarim.count}** kişiyi taga davet etmişsin.`)
            .addFields({name:"Taglıların:",value:`${pages[currentPage - 1].map((x,index)=> `${index + 1}. ${message.guild.members.cache.get(x.UserID).name} - <t:${(x.Date/1000).toFixed()}> (<t:${(x.Date/1000).toFixed()}:R>`)})`})
          ]})
        }
        if (button.customId === "geri"){
          if (button.customId === "cancel") {
            if (msg) msg.delete().catch(err => { });
            if (message) return message.delete().catch(err => { });
            await button.editReply({ content: `**Taglı Geçmişi Silindi!**`})
        }
        }
        })    
      })
     },

  };

  Array.prototype.chunk = function (chunk_size) {
    let myArray = Array.from(this);
    let tempArray = [];
    for (let index = 0; index < myArray.length; index += chunk_size) {
      let chunk = myArray.slice(index, index + chunk_size);
      tempArray.push(chunk);
    }
    return tempArray;
  };