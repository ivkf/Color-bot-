const { Client, GatewayIntentBits, REST, Routes, PermissionFlagsBits, Colors } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = ''; // توكن البوت
const CLIENT_ID = ''; // id البوت 
const GUILD_ID = ''; // id السيرفر

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
  
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    await createColorRoles(guild);
  }
});

client.on('guildCreate', async guild => {
  console.log(`Joined new guild: ${guild.name}`);
  await createColorRoles(guild);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, member, guild } = interaction;

  if (commandName === 'set_color') {
    const colorNumber = options.getInteger('color');
    const roleName = `${colorNumber}`;
    const role = guild.roles.cache.find(r => r.name === roleName);
    if (!role) return interaction.reply('Color role not found.');

    await member.roles.add(role);
    await interaction.reply(`Your color has been set to ${roleName}.`);
  } else if (commandName === 'remove_color') {
    const colorNumber = options.getInteger('color');
    const roleName = `${colorNumber}`;
    const role = guild.roles.cache.find(r => r.name === roleName);
    if (!role) return interaction.reply('Color role not found.');

    await member.roles.remove(role);
    await interaction.reply(`Color ${roleName} has been removed.`);
  }
});

const createColorRoles = async guild => {
  const colorNames = generateColorNames(70);
  for (const colorName of colorNames) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    await guild.roles.create({
      name: colorName.toString(),
    });
  }
  console.log('70 color roles created.');
};

const generateColorNames = count => {
  const colorNames = [];
  for (let i = 1; i <= count; i++) {
    colorNames.push(i);
  }
  return colorNames;
};

const registerCommands = async () => {
  const commands = [
    {
      name: 'set_color',
      description: 'Set your color role',
      options: [
        {
          name: 'color',
          type: 4,
          description: 'The number of the color role to set',
          required: true,
        },
      ],
    },
    {
      name: 'remove_color',
      description: 'Remove your color role',
      options: [
        {
          name: 'color',
          type: 4,
          description: 'The number of the color role to remove',
          required: true,
        },
      ],
    },
  ];

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

client.login(DISCORD_TOKEN);
