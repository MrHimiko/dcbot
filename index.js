// Require necessary packages
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Configuration with your specific channels
const config = {
  welcomeChannelId: '1364288681342668811', // Replace with welcome channel ID
  introductionsChannelId: '1364288681342668811', // Replace with introductions channel ID
  helpChannelId: '1333796364454334569', // Replace with help channel ID
  feedbackChannelId: '1230234571887612076', // Replace with feedback channel ID
  helpUsGrowChannelId: '1364291045508120577', // Replace with help-us-grow channel ID
  welcomeBackgroundImage: './assets/discord-welcome-divhunt.jpg', // Path to your welcome background image
};

// Bot startup
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Divhunt is ready to welcome new members!`);
});

// Function to create welcome image
async function createWelcomeImage(member, memberCount) {
  // Create canvas
  const canvas = Canvas.createCanvas(600, 250);
  const ctx = canvas.getContext('2d');

  // Load background image
  const background = await Canvas.loadImage(config.welcomeBackgroundImage);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Add semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw circular border for avatar
  const avatarSize = 128;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 90, avatarSize/2 + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db'; // Blue border
  ctx.fill();

  // Draw circular avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 90, avatarSize/2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Load user avatar
  const avatar = await Canvas.loadImage(
    member.displayAvatarURL({ extension: 'png', size: 256 })
  );
  ctx.drawImage(avatar, canvas.width / 2 - avatarSize/2, 90 - avatarSize/2, avatarSize, avatarSize);
  ctx.restore();

  // Add welcome text
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`The amazing ${member.user.username} just joined Divhunt! 🎉 Let's build together!`, canvas.width / 2, 180);

  // Add member count
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Member #${memberCount}`, canvas.width / 2, 210);

  // Return the created image
  return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });
}

// Welcome new members
client.on('guildMemberAdd', async (member) => {
  try {
    // Get welcome channel
    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!welcomeChannel) return;

    // Count members (you may want to filter bots)
    const memberCount = member.guild.memberCount;

    // Create welcome image
    const welcomeImage = await createWelcomeImage(member, memberCount);

    // Send welcome message with image
    await welcomeChannel.send({
      content: `Hey ${member}! Glad to see you here!\n\nWelcome to **${member.guild.name}**!\n\n• Please introduce yourself in <#${config.introductionsChannelId}> 🎭・introductions\n• You can find all sorts of tutorials in the Tutorials category below\n• If you ever need help, post your questions in <#${config.helpChannelId}> 🆘・help\n• Your feedback is very welcome after playing around with the platform - share it in <#${config.feedbackChannelId}> 💬・feedback\n\nIf you love what we do, don't forget to support us on social media! Read more in <#${config.helpUsGrowChannelId}> 📱・help-us-grow`,
      files: [welcomeImage]
    });

    console.log(`Welcomed ${member.user.tag} to the server!`);
  } catch (error) {
    console.error('Error welcoming new member:', error);
  }
});

// Login to Discord with your bot token
client.login(process.env.TOKEN);