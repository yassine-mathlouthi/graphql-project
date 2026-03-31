// src/seed.js
const mongoose = require('mongoose');
const Game     = require('./models/Game');
const Studio   = require('./models/Studio');
const Review   = require('./models/Review');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Game.deleteMany(), Studio.deleteMany(), Review.deleteMany()]);

  // --- Studios ---
  const studios = await Studio.insertMany([
    { name: 'Nintendo' },
    { name: 'CD Projekt Red' },
    { name: 'Rockstar Games' },
    { name: 'FromSoftware' },
    { name: 'Naughty Dog' },
    { name: 'Bethesda' },
    { name: 'Ubisoft' },
    { name: 'Valve' },
  ]);

  const [nintendo, cdpr, rockstar, fromsoftware, naughtydog, bethesda, ubisoft, valve] = studios;

  // --- Games ---
  const games = await Game.insertMany([
    // Nintendo
    { title: 'Breath of the Wild',      year: 2017, studio: nintendo._id,      genres: ['Adventure', 'RPG', 'Open World'] },
    { title: 'Tears of the Kingdom',    year: 2023, studio: nintendo._id,      genres: ['Adventure', 'RPG', 'Open World'] },
    { title: 'Super Mario Odyssey',     year: 2017, studio: nintendo._id,      genres: ['Platformer', 'Adventure'] },
    { title: 'Mario Kart 8 Deluxe',     year: 2017, studio: nintendo._id,      genres: ['Racing', 'Multiplayer'] },

    // CD Projekt Red
    { title: 'The Witcher 3',           year: 2015, studio: cdpr._id,          genres: ['RPG', 'Open World'] },
    { title: 'Cyberpunk 2077',          year: 2020, studio: cdpr._id,          genres: ['RPG', 'Action', 'Open World'] },

    // Rockstar Games
    { title: 'Red Dead Redemption 2',   year: 2018, studio: rockstar._id,      genres: ['Action', 'Adventure', 'Open World'] },
    { title: 'GTA V',                   year: 2013, studio: rockstar._id,      genres: ['Action', 'Open World', 'Multiplayer'] },

    // FromSoftware
    { title: 'Elden Ring',              year: 2022, studio: fromsoftware._id,  genres: ['RPG', 'Action', 'Open World'] },
    { title: 'Dark Souls III',          year: 2016, studio: fromsoftware._id,  genres: ['RPG', 'Action'] },
    { title: 'Sekiro',                  year: 2019, studio: fromsoftware._id,  genres: ['Action', 'Adventure'] },
    { title: 'Bloodborne',              year: 2015, studio: fromsoftware._id,  genres: ['RPG', 'Action'] },

    // Naughty Dog
    { title: 'The Last of Us Part I',   year: 2022, studio: naughtydog._id,    genres: ['Action', 'Adventure', 'Survival'] },
    { title: 'The Last of Us Part II',  year: 2020, studio: naughtydog._id,    genres: ['Action', 'Adventure', 'Survival'] },
    { title: 'Uncharted 4',             year: 2016, studio: naughtydog._id,    genres: ['Action', 'Adventure'] },

    // Bethesda
    { title: 'Skyrim',                  year: 2011, studio: bethesda._id,      genres: ['RPG', 'Open World'] },
    { title: 'Fallout 4',               year: 2015, studio: bethesda._id,      genres: ['RPG', 'Action', 'Open World'] },

    // Ubisoft
    { title: 'Assassin\'s Creed Origins', year: 2017, studio: ubisoft._id,    genres: ['Action', 'Adventure', 'Open World'] },
    { title: 'Far Cry 5',               year: 2018, studio: ubisoft._id,       genres: ['Action', 'Open World'] },

    // Valve
    { title: 'Portal 2',                year: 2011, studio: valve._id,         genres: ['Puzzle', 'Adventure', 'Multiplayer'] },
    { title: 'Half-Life: Alyx',         year: 2020, studio: valve._id,         genres: ['Action', 'VR'] },
  ]);

  // Map games by title for easy reference
  const g = {};
  games.forEach(game => { g[game.title] = game; });

  // --- Reviews ---
  await Review.insertMany([
    // Breath of the Wild
    { rating: 10, comment: 'Absolute masterpiece, redefined open world games.',        game: g['Breath of the Wild']._id },
    { rating: 9,  comment: 'Stunning exploration, a bit light on story.',               game: g['Breath of the Wild']._id },
    { rating: 10, comment: 'Nothing like it. Every corner hides a surprise.',           game: g['Breath of the Wild']._id },

    // Tears of the Kingdom
    { rating: 10, comment: 'Even better than BotW. The sky islands are breathtaking.', game: g['Tears of the Kingdom']._id },
    { rating: 9,  comment: 'Ultrahand mechanic is genius, slightly repetitive shrines.',game: g['Tears of the Kingdom']._id },

    // Super Mario Odyssey
    { rating: 9,  comment: 'Pure joy from start to finish.',                            game: g['Super Mario Odyssey']._id },
    { rating: 10, comment: 'Best 3D Mario ever made.',                                  game: g['Super Mario Odyssey']._id },

    // The Witcher 3
    { rating: 10, comment: 'The gold standard of RPGs. Incredible writing.',            game: g['The Witcher 3']._id },
    { rating: 9,  comment: 'Huge world with great quests. Combat feels dated.',         game: g['The Witcher 3']._id },
    { rating: 10, comment: 'Blood and Wine DLC alone is worth the price.',              game: g['The Witcher 3']._id },

    // Cyberpunk 2077
    { rating: 8,  comment: 'Rough launch but 2.0 update transformed the game.',        game: g['Cyberpunk 2077']._id },
    { rating: 9,  comment: 'Incredible atmosphere and story, V is a great protagonist.',game: g['Cyberpunk 2077']._id },
    { rating: 6,  comment: 'Still buggy on my end, but the world design is stunning.',  game: g['Cyberpunk 2077']._id },

    // Red Dead Redemption 2
    { rating: 10, comment: 'The most immersive open world ever created.',               game: g['Red Dead Redemption 2']._id },
    { rating: 10, comment: 'Arthur Morgan is one of gaming\'s greatest characters.',   game: g['Red Dead Redemption 2']._id },
    { rating: 9,  comment: 'Slow paced but deeply rewarding.',                          game: g['Red Dead Redemption 2']._id },

    // Elden Ring
    { rating: 10, comment: 'FromSoftware at their absolute peak.',                      game: g['Elden Ring']._id },
    { rating: 9,  comment: 'Punishing but fair. The Lands Between is breathtaking.',   game: g['Elden Ring']._id },
    { rating: 8,  comment: 'Great game, late game bosses feel unbalanced.',             game: g['Elden Ring']._id },

    // Dark Souls III
    { rating: 9,  comment: 'Tight level design and brutal but satisfying combat.',     game: g['Dark Souls III']._id },
    { rating: 8,  comment: 'Great finale to the trilogy.',                              game: g['Dark Souls III']._id },

    // Sekiro
    { rating: 10, comment: 'The parry system is perfection once it clicks.',            game: g['Sekiro']._id },
    { rating: 7,  comment: 'Too hard for me personally, but undeniably brilliant.',     game: g['Sekiro']._id },

    // The Last of Us
    { rating: 10, comment: 'Best narrative experience in gaming.',                      game: g['The Last of Us Part I']._id },
    { rating: 10, comment: 'Joel and Ellie\'s story is unforgettable.',                game: g['The Last of Us Part I']._id },

    // The Last of Us Part II
    { rating: 10, comment: 'Brave, brutal, and emotionally devastating.',               game: g['The Last of Us Part II']._id },
    { rating: 7,  comment: 'Great gameplay, divisive story choices.',                   game: g['The Last of Us Part II']._id },

    // Skyrim
    { rating: 9,  comment: 'Still holds up after all these years.',                     game: g['Skyrim']._id },
    { rating: 8,  comment: 'Massive world, thin RPG mechanics but hugely fun.',         game: g['Skyrim']._id },

    // Portal 2
    { rating: 10, comment: 'Funniest and cleverest game ever made.',                    game: g['Portal 2']._id },
    { rating: 10, comment: 'Co-op mode alone makes it worth every penny.',              game: g['Portal 2']._id },

    // Half-Life: Alyx
    { rating: 10, comment: 'The killer app for VR. Absolutely stunning.',               game: g['Half-Life: Alyx']._id },
    { rating: 9,  comment: 'Needs a VR headset but nothing else comes close.',          game: g['Half-Life: Alyx']._id },
  ]);

  console.log(`✅ Seeded:`);
  console.log(`   ${studios.length} studios`);
  console.log(`   ${games.length} games`);
  console.log(`   35 reviews`);
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});