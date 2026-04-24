//finished this command at 2:14 am oh my god i should go to sleep
//ported this command to lee bot on april 23rd 2025 at 3:01 pm
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const sharp = require("sharp");
const { download } = require("../../scripts/utils");
const fs = require("fs");
const fun_facts = [
  "Fun fact: I originally stayed up until 2 AM when programming the first version of this command.",
  "Fun fact: This command uses the https://pokeapi.co/ API to source all the pokedex data.",
  "Fun fact: Pokémon Day is the same day as my birthday! I share a birthday with Pokémon!",
];
const type_emojis = {
  bug: "<:bug_type:1270034320735862835> ",
  dark: "<:dark_type:1270034070168141996>",
  dragon: "<:dragon_type:1270034067529797674>",
  electric: "<:electric_type:1270034318638710815>",
  fairy: "<:fairy_type:1270034062656143361>",
  fighting: "<:fighting_type:1270034317351059458>",
  fire: "<:fire_type:1270034059313021020>",
  flying: "<:flying_type:1270034057736093727>",
  ghost: "<:ghost_type:1270034315555635260>",
  grass: "<:grass_type:1270034053239799860>",
  ground: "<:ground_type:1270034052195291156>",
  ice: "<:ice_type:1270034050060652544>",
  normal: "<:normal_type:1270034048617680896>",
  poison: "<:poison_type:1270034047401328700>",
  psychic: "<:psychic_type:1270034045270495245>",
  rock: "<:rock_type:1270034044259930112>",
  steel: "<:steel_type:1270034042884198430>",
  water: "<:water_type:1270034041248415898>",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pokedex")
    .setDescription("Grabs the Pokédex entry for a specified Pokémon")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get")
        .setDescription("Grabs the Pokédex entry for a specified Pokémon")
        .addStringOption((option) =>
          option
            .setName("pokemon")
            .setDescription(
              'The Pokémon you want the Pokédex entry for. Example: "miraidon" or "1008"',
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("game")
            .setDescription(
              'The game you want the Pokédex entry from. example: "violet"',
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("random")
        .setDescription("Grabs the Pokédex entry for a random Pokémon"),
    ),
  async execute(interaction) {
    async function errorHandling(statusCode) {
      switch (statusCode) {
        case 404:
          await interaction.editReply(
            `${capitalizeFirstLetter(
              pokemon,
            )} is either not a valid Pokémon, or ${capitalizeFirstLetter(
              pokemon,
            )} doesn't have a valid Pokédex entry in ${capitalizeFirstLetter(
              game,
            )}.`,
          );

          return;
        case 429:
          await interaction.editReply(
            `Lee is being ratelimited by the Pokédex API. Try again in a few minutes.`,
          );

          return;
      }
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    async function resizeImage(url, nat_dex_number) {
      var filepath = await download(url, "./temp/");

      let proc = sharp(filepath).resize(200, 200);

      await proc.toFile(`./temp/p${nat_dex_number}.png`);

      await fs.promises.unlink(filepath);

      filepath = `./temp/p${nat_dex_number}.png`;

      return filepath;
    }

    await interaction.deferReply();

    let subcommand = interaction.options.getSubcommand();

    var pokemon;
    var game;

    if (subcommand == "random") {
      pokemon = Math.floor(Math.random() * 1025) + 1;
    } else {
      pokemon = interaction.options.getString("pokemon").toLocaleLowerCase();
      game = interaction.options
        .getString("game")
        .toLocaleLowerCase()
        .replace(/[^a-zA-Z\s]/g, "")
        .replace(" ", "-");
    }
    if (game == "fire-red") {
      game = "firered";
    } else if (game == "leaf-green") {
      game = "leafgreen";
    }

    // //api for whatever reason doens't give info about oricorio unless you request via national dex number
    // if (pokemon === "oricorio") {
    //   pokemon = "741";
    // }

    try {
      var pokemon_species_data = await axios.get(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemon}`,
      );

      var pokemon_data = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemon_species_data.data.id}`,
      );

      var generation_data = await axios.get(
        `https://pokeapi.co/api/v2/generation/${pokemon_species_data.data.generation.name}`,
      );
    } catch (err) {
      console.error(err);
      errorHandling(err.response.status);
      return;
    }

    pokemon_species_data = pokemon_species_data.data;
    pokemon_data = pokemon_data.data;
    generation_data = generation_data.data;

    const debut_generation = generation_data.names.filter(
      (item) => item.language.name === "en",
    )[0].name;

    const front_sprite =
      pokemon_data.sprites.other["official-artwork"].front_default;

    const category = pokemon_species_data.genera.filter(
      (item) => item.language.name === "en",
    )[0].genus;

    const name = pokemon_species_data.names.filter(
      (item) => item.language.name === "en",
    )[0].name;

    const types = {
      first_type: pokemon_data.types[0].type.name,
      second_type:
        (pokemon_data.types[1] != undefined &&
          pokemon_data.types[1].type.name) ||
        "",
    };

    const nat_dex_number = pokemon_data.id;

    if (subcommand == "random") {
      var english = pokemon_species_data.flavor_text_entries.filter(
        (item) => item.language.name === "en",
      );

      var pokedex_entry = english[english.length - 1].flavor_text.replace(
        /[\r\n]+/g,
        " ",
      );

      game = english[english.length - 1].version.name;
    } else {
      try {
        pokedex_entry = pokemon_species_data.flavor_text_entries
          .filter((item) => item.version.name === game)
          .filter((item) => item.language.name === "en")[0]
          .flavor_text.replace(/[\r\n]+/g, " ");
      } catch (err) {
        console.error(err);
        await interaction.editReply(
          `${name} does not have a Pokédex entry in game ${capitalizeFirstLetter(
            game,
          )}!`,
        );
        return;
      }
    }

    if (game) {
      game = capitalizeFirstLetter(game);
    }

    if (!Number(pokemon)) {
      pokemon = capitalizeFirstLetter(pokemon);
    } else {
      pokemon = capitalizeFirstLetter(name);
    }

    const resized = await resizeImage(front_sprite, nat_dex_number);

    const pokedex_embed = new EmbedBuilder()
      .setImage(`attachment://p${nat_dex_number}.png`)
      .setColor((Math.random() > 0.5 && "#f04037") || "#ffffff")
      .setDescription(
        `# No. ${nat_dex_number}: ${name}\n## ${category}\n### ${pokedex_entry}\n# ${
          type_emojis[types.first_type]
        }${
          (types.second_type != "" && ` / ${type_emojis[types.second_type]}`) ||
          ""
        }\n### Debuted in ${debut_generation}`,
      )
      .setFooter({
        text: `Pokedéx Source: ${game}\n${fun_facts[Math.floor(Math.random() * fun_facts.length)]}`,
      });

    await interaction.editReply({
      embeds: [pokedex_embed],
      files: [resized],
    });

    await fs.promises.unlink(resized);
  },
};
